import { test } from "node:test";
import assert from "node:assert/strict";
import { WorkerRegistry } from "../src/domain/workers/WorkerRegistry.js";
import { WorkerIdleScheduler } from "../src/domain/workers/WorkerIdleScheduler.js";
import { WorkerPhase } from "../src/domain/workers/WorkerPhase.js";
import { SpotType, SPOT_TYPES } from "../src/domain/spots/SpotType.js";
import { EventRecord } from "../src/domain/events/EventRecord.js";
import { DEFAULT_CONFIG } from "../src/shared/config.js";
import type { SpotSlotsConfig } from "../src/shared/config.js";
import type { Clock } from "../src/domain/workers/Clock.js";

class SimulatedClock implements Clock {
  public constructor(private current: number) {}

  public now(): number {
    return this.current;
  }

  public advanceBy(deltaMs: number): void {
    this.current += deltaMs;
  }

  public advanceTo(target: number): void {
    this.current = Math.max(this.current, target);
  }
}

function mulberry32(seed: number): () => number {
  let a = seed;

  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function record(event: string, sessionId: string, ts: number, overrides: Record<string, unknown> = {}): EventRecord {
  const built = EventRecord.fromRaw({
    ts,
    event,
    sessionId,
    cwd: "/home/user/project",
    ...overrides,
  });

  if (!built) {
    throw new Error("failed to build EventRecord fixture");
  }

  return built;
}

function assertSpotInvariants(registry: WorkerRegistry, spots: SpotSlotsConfig): void {
  const capacityOf: Record<SpotType, number> = {
    [SpotType.Mine]: spots.mine,
    [SpotType.Forest]: spots.forest,
    [SpotType.River]: spots.river,
  };
  const atSpotCounts = new Map<SpotType, number>(SPOT_TYPES.map((type) => [type, 0]));
  const queuedCounts = new Map<SpotType, number>(SPOT_TYPES.map((type) => [type, 0]));

  for (const worker of registry.list()) {
    if (worker.phase === WorkerPhase.AtSpot) {
      atSpotCounts.set(worker.spotType, (atSpotCounts.get(worker.spotType) ?? 0) + 1);
    } else if (worker.phase === WorkerPhase.Queued) {
      queuedCounts.set(worker.spotType, (queuedCounts.get(worker.spotType) ?? 0) + 1);
    }
  }

  for (const type of SPOT_TYPES) {
    const atSpot = atSpotCounts.get(type) ?? 0;
    const queued = queuedCounts.get(type) ?? 0;
    const capacity = capacityOf[type];

    assert.ok(atSpot <= capacity, `spot ${type} overbooked: ${atSpot} workers on ${capacity} slots`);

    if (queued > 0) {
      assert.equal(atSpot, capacity, `spot ${type} has ${queued} queued workers but a free slot`);
    }
  }
}

test("a single worker walks through every event of the CLAUDE.md reaction table in order", () => {
  const registry = new WorkerRegistry({ mine: 1, forest: 1, river: 1 }, () => 0);
  const clock = new SimulatedClock(0);
  const scheduler = new WorkerIdleScheduler(registry, clock, DEFAULT_CONFIG.idle, DEFAULT_CONFIG.subagents);

  registry.apply(record("SessionStart", "s1", 0));
  let worker = registry.get("s1");
  assert.ok(worker);
  assert.equal(worker.spotType, SpotType.Mine);
  assert.equal(worker.phase, WorkerPhase.AtSpot);
  assert.equal(worker.hasQuestion, false);
  assert.equal(worker.hasAlert, false);

  registry.apply(record("UserPromptSubmit", "s1", 1000));
  assert.equal(registry.get("s1")?.hasQuestion, false);

  registry.apply(record("PreToolUse", "s1", 1500, { toolName: "Bash" }));
  assert.equal(registry.get("s1")?.isWorking, true);

  registry.apply(record("PermissionRequest", "s1", 1600, { toolName: "Bash" }));
  assert.equal(registry.get("s1")?.hasAlert, true);

  registry.apply(record("PostToolUse", "s1", 1700, { toolName: "Bash" }));
  assert.equal(registry.get("s1")?.hasAlert, false);
  assert.equal(registry.get("s1")?.isWorking, true);
  assert.equal(registry.resourceCounters.get(SpotType.Mine), 1);

  registry.apply(record("Notification", "s1", 1800, { notificationType: "idle_prompt" }));
  assert.equal(registry.get("s1")?.hasAlert, false);
  assert.equal(registry.get("s1")?.lastEventAt, 1700);

  registry.apply(record("Notification", "s1", 1850));
  assert.equal(registry.get("s1")?.hasAlert, true);

  registry.apply(record("Stop", "s1", 1900));
  worker = registry.get("s1");
  assert.equal(worker?.hasQuestion, true);
  assert.equal(worker?.hasAlert, false);
  assert.equal(worker?.isWorking, false);

  clock.advanceTo(1900 + DEFAULT_CONFIG.idle.campfireAfterSec * 1000);
  scheduler.tick();
  assert.equal(registry.get("s1")?.phase, WorkerPhase.AtCampfire);

  clock.advanceTo(1900 + DEFAULT_CONFIG.idle.tavernAfterSec * 1000);
  scheduler.tick();
  assert.equal(registry.get("s1")?.phase, WorkerPhase.AtTavern);

  clock.advanceTo(1900 + DEFAULT_CONFIG.idle.vanishAfterSec * 1000);
  scheduler.tick();
  assert.equal(registry.get("s1")?.phase, WorkerPhase.Gone);

  registry.apply(record("UserPromptSubmit", "s1", clock.now() + 1000));
  worker = registry.get("s1");
  assert.equal(worker?.phase, WorkerPhase.AtSpot);
  assert.equal(worker?.spotType, SpotType.Mine);
  assert.equal(worker?.hasQuestion, false);

  registry.apply(record("SubagentStart", "s1", clock.now() + 1100, { agentId: "a1" }));
  assert.equal(registry.get("s1")?.subagentCount(), 1);

  registry.apply(record("PreToolUse", "s1", clock.now() + 1200, { toolName: "Read", agentId: "a1" }));
  registry.apply(record("PostToolUse", "s1", clock.now() + 1300, { toolName: "Read", agentId: "a1" }));
  assert.equal(registry.resourceCounters.get(SpotType.Mine), 2);

  registry.apply(record("SubagentStop", "s1", clock.now() + 1400, { agentId: "a1" }));
  assert.equal(registry.get("s1")?.subagentCount(), 0);

  registry.apply(record("SessionEnd", "s1", clock.now() + 1500));
  assert.equal(registry.get("s1"), undefined);
  assertSpotInvariants(registry, { mine: 1, forest: 1, river: 1 });
});

test("20+ concurrent sessions never overbook a spot and never leave a free slot while a queue waits", () => {
  const spots: SpotSlotsConfig = DEFAULT_CONFIG.spots;
  const rng = mulberry32(1337);
  const registry = new WorkerRegistry(spots, rng);
  const clock = new SimulatedClock(0);
  const scheduler = new WorkerIdleScheduler(registry, clock, DEFAULT_CONFIG.idle, DEFAULT_CONFIG.subagents);

  const sessionCount = 24;
  const sessionIds = Array.from({ length: sessionCount }, (_, i) => `session-${i}`);

  for (const sessionId of sessionIds) {
    clock.advanceBy(Math.floor(rng() * 50));
    registry.apply(record("SessionStart", sessionId, clock.now()));
    assertSpotInvariants(registry, spots);
  }

  const totalCapacity = spots.mine + spots.forest + spots.river;
  const atSpotAfterSpawn = registry.list().filter((worker) => worker.phase === WorkerPhase.AtSpot).length;
  assert.equal(atSpotAfterSpawn, Math.min(totalCapacity, sessionCount));

  const actions = [
    "prompt",
    "pre",
    "permission",
    "post",
    "stop",
    "subagentStart",
    "subagentStop",
    "sessionEnd",
    "tick",
  ] as const;

  for (let i = 0; i < 1000; i++) {
    clock.advanceBy(Math.floor(rng() * 5000));
    const action = actions[Math.floor(rng() * actions.length)] ?? "tick";

    if (action === "tick") {
      scheduler.tick();
      assertSpotInvariants(registry, spots);
      continue;
    }

    const sessionId = sessionIds[Math.floor(rng() * sessionIds.length)];
    if (sessionId === undefined) {
      continue;
    }

    switch (action) {
      case "prompt":
        registry.apply(record("UserPromptSubmit", sessionId, clock.now()));
        break;
      case "pre":
        registry.apply(record("PreToolUse", sessionId, clock.now(), { toolName: "Bash" }));
        break;
      case "permission":
        registry.apply(record("PermissionRequest", sessionId, clock.now(), { toolName: "Bash" }));
        break;
      case "post":
        registry.apply(record("PostToolUse", sessionId, clock.now(), { toolName: "Bash" }));
        break;
      case "stop":
        registry.apply(record("Stop", sessionId, clock.now()));
        break;
      case "subagentStart":
        registry.apply(record("SubagentStart", sessionId, clock.now(), { agentId: `${sessionId}-agent` }));
        break;
      case "subagentStop":
        registry.apply(record("SubagentStop", sessionId, clock.now(), { agentId: `${sessionId}-agent` }));
        break;
      case "sessionEnd":
        registry.apply(record("SessionEnd", sessionId, clock.now()));
        break;
    }

    assertSpotInvariants(registry, spots);
  }

  clock.advanceBy(DEFAULT_CONFIG.idle.vanishAfterSec * 1000 * 2);
  scheduler.tick();
  assertSpotInvariants(registry, spots);

  const remaining = registry.list();
  const stillHoldingASpot = remaining.filter(
    (worker) => worker.phase === WorkerPhase.AtSpot || worker.phase === WorkerPhase.Queued,
  );
  assert.equal(stillHoldingASpot.length, 0);
});
