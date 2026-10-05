import { test } from "node:test";
import assert from "node:assert/strict";
import { WorkerTooltipText, type TooltipWorker } from "../src/client/world/WorkerTooltipText.js";
import { WorkerPhase } from "../src/domain/workers/WorkerPhase.js";

const NOW = 1_000_000;

function worker(overrides: Partial<TooltipWorker> = {}): TooltipWorker {
  return {
    projectName: "village",
    phase: WorkerPhase.AtSpot,
    isWorking: false,
    hasAlert: false,
    hasQuestion: false,
    lastEventAt: NOW,
    ...overrides,
  };
}

test("first line is the project name and last line is the time since the last event", () => {
  const text = new WorkerTooltipText();

  const lines = text.lines(worker({ projectName: "fox", lastEventAt: NOW - 5_000 }), NOW);

  assert.equal(lines[0], "fox");
  assert.equal(lines[2], "last event 5s ago");
});

test("a permission request outranks every other status", () => {
  const text = new WorkerTooltipText();

  const lines = text.lines(
    worker({ phase: WorkerPhase.Resting, isWorking: true, hasAlert: true, hasQuestion: true }),
    NOW,
  );

  assert.equal(lines[1], "waiting for permission");
});

test("a question outranks resting and working", () => {
  const text = new WorkerTooltipText();

  const lines = text.lines(worker({ phase: WorkerPhase.Resting, isWorking: true, hasQuestion: true }), NOW);

  assert.equal(lines[1], "waiting for reply");
});

test("a worker resting on its spot reads as resting", () => {
  const text = new WorkerTooltipText();

  const lines = text.lines(worker({ phase: WorkerPhase.Resting }), NOW);

  assert.equal(lines[1], "resting on the spot");
});

test("a working worker at a spot reads as working, an idle one as idle", () => {
  const text = new WorkerTooltipText();

  assert.equal(text.lines(worker({ isWorking: true }), NOW)[1], "working");
  assert.equal(text.lines(worker({ isWorking: false }), NOW)[1], "idle at spot");
});

test("elapsed time uses seconds, then minutes, then hours, rounding down", () => {
  const text = new WorkerTooltipText();
  const ago = (elapsedMs: number): string => text.lines(worker({ lastEventAt: NOW - elapsedMs }), NOW)[2] ?? "";

  assert.equal(ago(0), "last event 0s ago");
  assert.equal(ago(59_999), "last event 59s ago");
  assert.equal(ago(60_000), "last event 1m ago");
  assert.equal(ago(3_599_999), "last event 59m ago");
  assert.equal(ago(3_600_000), "last event 1h ago");
});

test("a last event in the future shows zero seconds instead of a negative time", () => {
  const text = new WorkerTooltipText();

  const lines = text.lines(worker({ lastEventAt: NOW + 2_000 }), NOW);

  assert.equal(lines[2], "last event 0s ago");
});
