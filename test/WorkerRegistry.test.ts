import { test } from "node:test";
import assert from "node:assert/strict";
import { WorkerRegistry } from "../src/domain/workers/WorkerRegistry.js";
import { WorkerPhase } from "../src/domain/workers/WorkerPhase.js";
import { SpotType } from "../src/domain/spots/SpotType.js";
import { EventRecord } from "../src/domain/events/EventRecord.js";
import type { Clock } from "../src/domain/workers/Clock.js";

class FakeClock implements Clock {
  public constructor(private current: number) {}

  public now(): number {
    return this.current;
  }

  public set(value: number): void {
    this.current = value;
  }
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

function newRegistry(random: () => number = () => 0): WorkerRegistry {
  return new WorkerRegistry({ mine: 1, forest: 1, river: 1 }, new FakeClock(0), random);
}

test("SessionStart creates a worker at its assigned spot", () => {
  const registry = newRegistry();
  registry.apply(record("SessionStart", "s1", 1000));

  const worker = registry.get("s1");
  assert.ok(worker);
  assert.equal(worker.spotType, SpotType.Mine);
  assert.equal(worker.phase, WorkerPhase.AtSpot);
});

test("an event from an unknown session creates a worker as if SessionStart had fired", () => {
  const registry = newRegistry();
  registry.apply(record("PreToolUse", "s1", 1000, { toolName: "Bash" }));

  const worker = registry.get("s1");
  assert.ok(worker);
  assert.equal(worker.isWorking, true);
});

test("an idle_prompt Notification does not raise the alert and does not touch lastEventAt", () => {
  const registry = newRegistry();
  registry.apply(record("SessionStart", "s1", 1000));
  registry.apply(record("Stop", "s1", 1100));
  registry.apply(record("Notification", "s1", 1200, { notificationType: "idle_prompt" }));

  const worker = registry.get("s1");
  assert.equal(worker?.hasAlert, false);
  assert.equal(worker?.hasQuestion, true);
  assert.equal(worker?.lastEventAt, 1100);
});

test("SessionEnd removes the worker", () => {
  const registry = newRegistry();
  registry.apply(record("SessionStart", "s1", 1000));
  registry.apply(record("SessionEnd", "s1", 1100));

  assert.equal(registry.get("s1"), undefined);
});

test("SessionEnd frees the slot and promotes the next queued worker of the same type", () => {
  const registry = newRegistry();
  registry.apply(record("SessionStart", "s1", 1000));
  registry.apply(record("SessionStart", "s2", 1001));
  registry.apply(record("SessionStart", "s3", 1002));
  registry.apply(record("SessionStart", "s4", 1003));

  assert.equal(registry.get("s1")?.spotType, SpotType.Mine);
  assert.equal(registry.get("s4")?.spotType, SpotType.Mine);
  assert.equal(registry.get("s4")?.phase, WorkerPhase.Queued);

  registry.apply(record("SessionEnd", "s1", 1100));

  assert.equal(registry.get("s1"), undefined);
  assert.equal(registry.get("s4")?.phase, WorkerPhase.AtSpot);
});

test("SubagentStart and SubagentStop from an unknown session register a worker without crashing", () => {
  const registry = newRegistry();
  registry.apply(record("SubagentStart", "s1", 1000, { agentId: "a1" }));
  registry.apply(record("SubagentStop", "s1", 1100, { agentId: "a1" }));

  assert.ok(registry.get("s1"));
});
