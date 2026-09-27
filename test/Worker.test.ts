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

test("setPhase changes the phase directly", () => {
  const worker = new Worker("s1", "project", SpotType.Mine, true, 1000);

  worker.setPhase(WorkerPhase.AtCampfire);

  assert.equal(worker.phase, WorkerPhase.AtCampfire);
});

test("isAtSpot is true only while the phase is AtSpot", () => {
  const worker = new Worker("s1", "project", SpotType.Mine, true, 1000);

  assert.equal(worker.isAtSpot(), true);
  assert.equal(worker.isQueued(), false);

  worker.setPhase(WorkerPhase.AtCampfire);

  assert.equal(worker.isAtSpot(), false);
});

test("isQueued is true only while the phase is Queued", () => {
  const worker = new Worker("s1", "project", SpotType.Mine, false, 1000);

  assert.equal(worker.isQueued(), true);
  assert.equal(worker.isAtSpot(), false);

  worker.setPhase(WorkerPhase.AtSpot);

  assert.equal(worker.isQueued(), false);
});
