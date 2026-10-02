import { test } from "node:test";
import assert from "node:assert/strict";
import { WorkerState } from "../src/domain/workers/WorkerState.js";
import { Worker } from "../src/domain/workers/Worker.js";
import { WorkerPhase } from "../src/domain/workers/WorkerPhase.js";
import { SpotType } from "../src/domain/spots/SpotType.js";

test("from copies the worker's derived state, with removed defaulting to false", () => {
  const worker = new Worker("s1", "project", SpotType.Forest, true, 1000);
  worker.onPreTool(1100);
  worker.onSubagentActivity("a1", 1100);

  const snapshot = WorkerState.from(worker);

  assert.equal(snapshot.sessionId, "s1");
  assert.equal(snapshot.projectName, "project");
  assert.equal(snapshot.spotType, SpotType.Forest);
  assert.equal(snapshot.phase, WorkerPhase.AtSpot);
  assert.equal(snapshot.isWorking, true);
  assert.equal(snapshot.hasAlert, false);
  assert.equal(snapshot.hasQuestion, false);
  assert.equal(snapshot.subagentCount, 1);
  assert.equal(snapshot.lastEventAt, 1100);
  assert.equal(snapshot.removed, false);
});

test("asRemoved returns a copy with removed set to true", () => {
  const worker = new Worker("s1", "project", SpotType.Mine, true, 1000);

  const snapshot = WorkerState.from(worker).asRemoved();

  assert.equal(snapshot.removed, true);
  assert.equal(snapshot.sessionId, "s1");
});
