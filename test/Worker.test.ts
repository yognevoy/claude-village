import { test } from "node:test";
import assert from "node:assert/strict";
import { Worker } from "../src/domain/workers/Worker.js";
import { WorkerPhase } from "../src/domain/workers/WorkerPhase.js";
import { SpotType } from "../src/domain/spots/SpotType.js";

test("constructor starts at AtSpot when it occupies a slot", () => {
  const worker = new Worker("s1", "project", SpotType.Mine, true, 1000);

  assert.equal(worker.phase, WorkerPhase.AtSpot);
  assert.equal(worker.lastEventAt, 1000);
  assert.equal(worker.isWorking, false);
  assert.equal(worker.hasAlert, false);
  assert.equal(worker.hasQuestion, false);
});

test("constructor starts at Queued when it does not occupy a slot", () => {
  const worker = new Worker("s1", "project", SpotType.Mine, false, 1000);

  assert.equal(worker.phase, WorkerPhase.Queued);
});

test("onSessionStart updates the project name and touches lastEventAt", () => {
  const worker = new Worker("s1", "old-project", SpotType.Mine, true, 1000);

  worker.onSessionStart("new-project", 2000);

  assert.equal(worker.projectName, "new-project");
  assert.equal(worker.lastEventAt, 2000);
});

test("onPromptSubmit clears a pending question and touches lastEventAt", () => {
  const worker = new Worker("s1", "project", SpotType.Mine, true, 1000);
  worker.onStop(1100);

  worker.onPromptSubmit(1200);

  assert.equal(worker.hasQuestion, false);
  assert.equal(worker.lastEventAt, 1200);
});

test("onPreTool starts working and touches lastEventAt", () => {
  const worker = new Worker("s1", "project", SpotType.Mine, true, 1000);

  worker.onPreTool(1100);

  assert.equal(worker.isWorking, true);
  assert.equal(worker.lastEventAt, 1100);
});

test("onAlertTriggered raises the alert and touches lastEventAt", () => {
  const worker = new Worker("s1", "project", SpotType.Mine, true, 1000);

  worker.onAlertTriggered(1100);

  assert.equal(worker.hasAlert, true);
  assert.equal(worker.lastEventAt, 1100);
});

test("onPostTool keeps working, clears the alert, and touches lastEventAt", () => {
  const worker = new Worker("s1", "project", SpotType.Mine, true, 1000);
  worker.onAlertTriggered(1100);

  worker.onPostTool(1200);

  assert.equal(worker.isWorking, true);
  assert.equal(worker.hasAlert, false);
  assert.equal(worker.lastEventAt, 1200);
});

test("onStop raises the question, clears the alert and working state, and touches lastEventAt", () => {
  const worker = new Worker("s1", "project", SpotType.Mine, true, 1000);
  worker.onAlertTriggered(1100);
  worker.onPreTool(1100);

  worker.onStop(1200);

  assert.equal(worker.hasQuestion, true);
  assert.equal(worker.hasAlert, false);
  assert.equal(worker.isWorking, false);
  assert.equal(worker.lastEventAt, 1200);
});

test("onSubagentActivity records the subagent and touches lastEventAt", () => {
  const worker = new Worker("s1", "project", SpotType.Mine, true, 1000);

  worker.onSubagentActivity("a1", 1100);

  assert.equal(worker.subagentCount(), 1);
  assert.equal(worker.lastEventAt, 1100);
});

test("onSubagentActivity for an already known subagent still counts as one subagent", () => {
  const worker = new Worker("s1", "project", SpotType.Mine, true, 1000);
  worker.onSubagentActivity("a1", 1100);

  worker.onSubagentActivity("a1", 1200);

  assert.equal(worker.subagentCount(), 1);
  assert.equal(worker.lastEventAt, 1200);
});

test("onSubagentStop removes the subagent without touching lastEventAt", () => {
  const worker = new Worker("s1", "project", SpotType.Mine, true, 1000);
  worker.onSubagentActivity("a1", 1100);

  worker.onSubagentStop("a1");

  assert.equal(worker.subagentCount(), 0);
  assert.equal(worker.lastEventAt, 1100);
});

test("subagents exposes the underlying registry for direct queries", () => {
  const worker = new Worker("s1", "project", SpotType.Mine, true, 1000);
  worker.onSubagentActivity("a1", 1000);

  worker.subagents.pruneIdle(1000 + 30_000, 30);

  assert.equal(worker.subagentCount(), 0);
});


test("setPhase changes the phase directly", () => {
  const worker = new Worker("s1", "project", SpotType.Mine, true, 1000);

  worker.setPhase(WorkerPhase.Resting);

  assert.equal(worker.phase, WorkerPhase.Resting);
});

test("occupiesSlot is true while the phase is AtSpot or Resting", () => {
  const worker = new Worker("s1", "project", SpotType.Mine, true, 1000);

  assert.equal(worker.occupiesSlot(), true);
  assert.equal(worker.isQueued(), false);

  worker.setPhase(WorkerPhase.Resting);

  assert.equal(worker.occupiesSlot(), true);

  worker.setPhase(WorkerPhase.Gone);

  assert.equal(worker.occupiesSlot(), false);
});

test("isQueued is true only while the phase is Queued", () => {
  const worker = new Worker("s1", "project", SpotType.Mine, false, 1000);

  assert.equal(worker.isQueued(), true);
  assert.equal(worker.occupiesSlot(), false);

  worker.setPhase(WorkerPhase.AtSpot);

  assert.equal(worker.isQueued(), false);
});

const thresholds = { restAfterSec: 300, leaveAfterSec: 600 };

test("idlePhaseAt returns null while idle time stays below the rest threshold", () => {
  const worker = new Worker("s1", "project", SpotType.Mine, true, 0);

  assert.equal(worker.idlePhaseAt(0, thresholds), null);
  assert.equal(worker.idlePhaseAt(299_999, thresholds), null);
});

test("idlePhaseAt returns Resting for a worker on its spot from the rest threshold up to the leave threshold", () => {
  const worker = new Worker("s1", "project", SpotType.Mine, true, 0);

  assert.equal(worker.idlePhaseAt(300_000, thresholds), WorkerPhase.Resting);
  assert.equal(worker.idlePhaseAt(599_999, thresholds), WorkerPhase.Resting);
});

test("idlePhaseAt returns Gone from the leave threshold onward", () => {
  const worker = new Worker("s1", "project", SpotType.Mine, true, 0);

  assert.equal(worker.idlePhaseAt(600_000, thresholds), WorkerPhase.Gone);
  assert.equal(worker.idlePhaseAt(50_000_000, thresholds), WorkerPhase.Gone);
});

test("idlePhaseAt does not rest a queued worker, only leaves it", () => {
  const worker = new Worker("s1", "project", SpotType.Mine, false, 0);

  assert.equal(worker.idlePhaseAt(300_000, thresholds), null);
  assert.equal(worker.idlePhaseAt(600_000, thresholds), WorkerPhase.Gone);
});

test("idlePhaseAt measures idle time from lastEventAt, not from worker creation", () => {
  const worker = new Worker("s1", "project", SpotType.Mine, true, 1000);
  worker.onPostTool(500_000);

  assert.equal(worker.idlePhaseAt(500_000 + 300_000, thresholds), WorkerPhase.Resting);
});
