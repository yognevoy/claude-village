import { test } from "node:test";
import assert from "node:assert/strict";
import { WorkerIdleScheduler, type IdleWorkerStore } from "../src/domain/workers/WorkerIdleScheduler.js";
import { Worker } from "../src/domain/workers/Worker.js";
import { WorkerPhase } from "../src/domain/workers/WorkerPhase.js";
import { SpotType } from "../src/domain/spots/SpotType.js";
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

class FakeIdleWorkerStore implements IdleWorkerStore {
  public readonly workers: Worker[] = [];
  public readonly idleCalls: { sessionId: string; phase: WorkerPhase }[] = [];
  public readonly restCalls: string[] = [];
  public promoted: Worker | null = null;

  public list(): readonly Worker[] {
    return this.workers;
  }

  public idle(worker: Worker, phase: WorkerPhase): Worker | null {
    this.idleCalls.push({ sessionId: worker.sessionId, phase });
    worker.setPhase(phase);
    return this.promoted;
  }

  public rest(worker: Worker): void {
    this.restCalls.push(worker.sessionId);
    worker.setPhase(WorkerPhase.Resting);
  }
}

const thresholds = { restAfterSec: 300, leaveAfterSec: 600 };
const subagents = { maxVisible: 6, idleSec: 30 };

test("does nothing while a worker's idle time stays below the rest threshold", () => {
  const store = new FakeIdleWorkerStore();
  const worker = new Worker("s1", "project", SpotType.Mine, true, 0);
  store.workers.push(worker);
  const clock = new FakeClock(299_000);

  new WorkerIdleScheduler(store, clock, thresholds, subagents).tick();

  assert.equal(store.restCalls.length, 0);
  assert.equal(store.idleCalls.length, 0);
  assert.equal(worker.phase, WorkerPhase.AtSpot);
});

test("makes a worker rest on its spot once its idle time reaches the rest threshold", () => {
  const store = new FakeIdleWorkerStore();
  const worker = new Worker("s1", "project", SpotType.Mine, true, 0);
  store.workers.push(worker);
  const clock = new FakeClock(300_000);

  const changed = new WorkerIdleScheduler(store, clock, thresholds, subagents).tick();

  assert.deepEqual(store.restCalls, ["s1"]);
  assert.equal(store.idleCalls.length, 0);
  assert.deepEqual(changed, [worker]);
});

test("makes a worker leave once its idle time reaches the leave threshold", () => {
  const store = new FakeIdleWorkerStore();
  const worker = new Worker("s1", "project", SpotType.Mine, true, 0);
  store.workers.push(worker);
  const clock = new FakeClock(600_000);

  new WorkerIdleScheduler(store, clock, thresholds, subagents).tick();

  assert.deepEqual(store.idleCalls, [{ sessionId: "s1", phase: WorkerPhase.Gone }]);
});

test("includes the promoted worker returned by the store in the changed set", () => {
  const store = new FakeIdleWorkerStore();
  const worker = new Worker("s1", "project", SpotType.Mine, true, 0);
  const promoted = new Worker("s2", "project", SpotType.Mine, false, 0);
  store.workers.push(worker);
  store.promoted = promoted;
  const clock = new FakeClock(600_000);

  const changed = new WorkerIdleScheduler(store, clock, thresholds, subagents).tick();

  assert.deepEqual(new Set(changed), new Set([worker, promoted]));
});

test("does not rest again a worker that already rests", () => {
  const store = new FakeIdleWorkerStore();
  const worker = new Worker("s1", "project", SpotType.Mine, true, 0);
  worker.setPhase(WorkerPhase.Resting);
  store.workers.push(worker);
  const clock = new FakeClock(350_000);

  new WorkerIdleScheduler(store, clock, thresholds, subagents).tick();

  assert.equal(store.restCalls.length, 0);
  assert.equal(store.idleCalls.length, 0);
});

test("evaluates each worker independently on the same tick", () => {
  const store = new FakeIdleWorkerStore();
  const freshWorker = new Worker("s1", "project", SpotType.Mine, true, 400_000);
  const idleWorker = new Worker("s2", "project", SpotType.Forest, true, 0);
  store.workers.push(freshWorker, idleWorker);
  const clock = new FakeClock(400_000);

  new WorkerIdleScheduler(store, clock, thresholds, subagents).tick();

  assert.deepEqual(store.restCalls, ["s2"]);
  assert.equal(store.idleCalls.length, 0);
});

test("also prunes a worker's subagents that have been silent past the subagent idleSec", () => {
  const store = new FakeIdleWorkerStore();
  const worker = new Worker("s1", "project", SpotType.Mine, true, 0);
  worker.onSubagentActivity("a1", 0);
  store.workers.push(worker);
  const clock = new FakeClock(30_000);

  const changed = new WorkerIdleScheduler(store, clock, thresholds, subagents).tick();

  assert.equal(worker.subagentCount(), 0);
  assert.deepEqual(changed, [worker]);
});

test("keeps a worker's subagent that has been refreshed recently", () => {
  const store = new FakeIdleWorkerStore();
  const worker = new Worker("s1", "project", SpotType.Mine, true, 0);
  worker.onSubagentActivity("a1", 0);
  store.workers.push(worker);
  const clock = new FakeClock(29_000);

  new WorkerIdleScheduler(store, clock, thresholds, subagents).tick();

  assert.equal(worker.subagentCount(), 1);
});
