import { test } from "node:test";
import assert from "node:assert/strict";
import { EventResult } from "../src/domain/workers/EventResult.js";
import { Worker } from "../src/domain/workers/Worker.js";
import { SpotType } from "../src/domain/spots/SpotType.js";

test("empty carries no promoted worker", () => {
  const result = EventResult.empty();

  assert.equal(result.promoted, null);
});

test("a promoted worker can be assembled directly", () => {
  const worker = new Worker("s1", "project", SpotType.Mine, true, 1000);

  const result = new EventResult(worker);

  assert.equal(result.promoted, worker);
});
