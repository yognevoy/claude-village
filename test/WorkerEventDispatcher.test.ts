import { test } from "node:test";
import assert from "node:assert/strict";
import { WorkerEventDispatcher, type WorkerLifecycle } from "../src/domain/workers/WorkerEventDispatcher.js";
import { Worker } from "../src/domain/workers/Worker.js";
import { SpotType } from "../src/domain/spots/SpotType.js";
import { EventRecord } from "../src/domain/events/EventRecord.js";

class FakeWorkerLifecycle implements WorkerLifecycle {
  private readonly workers = new Map<string, Worker>();
  public readonly wakeCalls: string[] = [];
  public readonly removeCalls: string[] = [];

  public spawn(record: EventRecord): Worker {
    const existing = this.workers.get(record.sessionId);

    if (existing !== undefined) {
      return existing;
    }

    const worker = new Worker(record.sessionId, record.projectName, SpotType.Mine, true, record.ts);
    this.workers.set(record.sessionId, worker);
    return worker;
  }

  public wake(worker: Worker): void {
    this.wakeCalls.push(worker.sessionId);
  }

  public remove(worker: Worker): void {
    this.removeCalls.push(worker.sessionId);
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

test("SessionStart calls onSessionStart and does not wake the worker", () => {
  const registry = new FakeWorkerLifecycle();
  const dispatcher = new WorkerEventDispatcher(registry);

  dispatcher.apply(record("SessionStart", "s1", 1000));

  assert.equal(registry.wakeCalls.length, 0);
});

test("UserPromptSubmit clears the question and wakes the worker", () => {
  const registry = new FakeWorkerLifecycle();
  const dispatcher = new WorkerEventDispatcher(registry);
  const worker = registry.spawn(record("SessionStart", "s1", 1000));
  worker.onStop(1050);

  dispatcher.apply(record("UserPromptSubmit", "s1", 1100));

  assert.equal(worker.hasQuestion, false);
  assert.deepEqual(registry.wakeCalls, ["s1"]);
});

test("PreToolUse without an agentId starts working and wakes the worker", () => {
  const registry = new FakeWorkerLifecycle();
  const dispatcher = new WorkerEventDispatcher(registry);
  const worker = registry.spawn(record("SessionStart", "s1", 1000));

  dispatcher.apply(record("PreToolUse", "s1", 1100, { toolName: "Bash" }));

  assert.equal(worker.isWorking, true);
  assert.deepEqual(registry.wakeCalls, ["s1"]);
});

test("PreToolUse from a subagent does not touch the parent worker or wake it", () => {
  const registry = new FakeWorkerLifecycle();
  const dispatcher = new WorkerEventDispatcher(registry);
  const worker = registry.spawn(record("SessionStart", "s1", 1000));

  dispatcher.apply(record("PreToolUse", "s1", 1100, { toolName: "Bash", agentId: "a1" }));

  assert.equal(worker.isWorking, false);
  assert.equal(registry.wakeCalls.length, 0);
});

test("PermissionRequest raises the alert and wakes the worker", () => {
  const registry = new FakeWorkerLifecycle();
  const dispatcher = new WorkerEventDispatcher(registry);
  const worker = registry.spawn(record("SessionStart", "s1", 1000));

  dispatcher.apply(record("PermissionRequest", "s1", 1100, { toolName: "Bash" }));

  assert.equal(worker.hasAlert, true);
  assert.deepEqual(registry.wakeCalls, ["s1"]);
});

test("PostToolUse without an agentId clears the alert and wakes the worker", () => {
  const registry = new FakeWorkerLifecycle();
  const dispatcher = new WorkerEventDispatcher(registry);
  const worker = registry.spawn(record("SessionStart", "s1", 1000));
  worker.onAlertTriggered(1050);

  dispatcher.apply(record("PostToolUse", "s1", 1100, { toolName: "Bash" }));

  assert.equal(worker.isWorking, true);
  assert.equal(worker.hasAlert, false);
  assert.deepEqual(registry.wakeCalls, ["s1"]);
});

test("PostToolUse from a subagent does not touch the parent worker or wake it", () => {
  const registry = new FakeWorkerLifecycle();
  const dispatcher = new WorkerEventDispatcher(registry);
  const worker = registry.spawn(record("SessionStart", "s1", 1000));

  dispatcher.apply(record("PostToolUse", "s1", 1100, { toolName: "Bash", agentId: "a1" }));

  assert.equal(worker.isWorking, false);
  assert.equal(registry.wakeCalls.length, 0);
});

test("an idle_prompt Notification does not raise the alert or wake the worker", () => {
  const registry = new FakeWorkerLifecycle();
  const dispatcher = new WorkerEventDispatcher(registry);
  const worker = registry.spawn(record("SessionStart", "s1", 1000));

  dispatcher.apply(record("Notification", "s1", 1100, { notificationType: "idle_prompt" }));

  assert.equal(worker.hasAlert, false);
  assert.equal(registry.wakeCalls.length, 0);
});

test("a non-idle Notification raises the alert and wakes the worker", () => {
  const registry = new FakeWorkerLifecycle();
  const dispatcher = new WorkerEventDispatcher(registry);
  const worker = registry.spawn(record("SessionStart", "s1", 1000));

  dispatcher.apply(record("Notification", "s1", 1100, { notificationType: "elicitation_dialog" }));

  assert.equal(worker.hasAlert, true);
  assert.deepEqual(registry.wakeCalls, ["s1"]);
});

test("Stop raises the question, clears the alert and working state, and wakes the worker", () => {
  const registry = new FakeWorkerLifecycle();
  const dispatcher = new WorkerEventDispatcher(registry);
  const worker = registry.spawn(record("SessionStart", "s1", 1000));
  worker.onPreTool(1050);
  worker.onAlertTriggered(1050);

  dispatcher.apply(record("Stop", "s1", 1100));

  assert.equal(worker.hasQuestion, true);
  assert.equal(worker.hasAlert, false);
  assert.equal(worker.isWorking, false);
  assert.deepEqual(registry.wakeCalls, ["s1"]);
});

test("SessionEnd removes the worker", () => {
  const registry = new FakeWorkerLifecycle();
  const dispatcher = new WorkerEventDispatcher(registry);
  registry.spawn(record("SessionStart", "s1", 1000));

  dispatcher.apply(record("SessionEnd", "s1", 1100));

  assert.deepEqual(registry.removeCalls, ["s1"]);
});

test("SubagentStart and SubagentStop only ensure the worker, without waking or removing it", () => {
  const registry = new FakeWorkerLifecycle();
  const dispatcher = new WorkerEventDispatcher(registry);

  dispatcher.apply(record("SubagentStart", "s1", 1000, { agentId: "a1" }));
  dispatcher.apply(record("SubagentStop", "s1", 1100, { agentId: "a1" }));

  assert.equal(registry.wakeCalls.length, 0);
  assert.equal(registry.removeCalls.length, 0);
});
