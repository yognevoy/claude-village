import { test } from "node:test";
import assert from "node:assert/strict";
import { WorkerDirection } from "../src/client/world/WorkerDirection.js";

test("faces right by default", () => {
  const direction = new WorkerDirection();

  assert.equal(direction.isFlipped, false);
});

test("flips when moving left", () => {
  const direction = new WorkerDirection();

  direction.turnToward(100, 40);

  assert.equal(direction.isFlipped, true);
});

test("turns back when moving right", () => {
  const direction = new WorkerDirection();

  direction.turnToward(100, 40);
  direction.turnToward(40, 120);

  assert.equal(direction.isFlipped, false);
});

test("keeps the last direction on vertical movement", () => {
  const direction = new WorkerDirection();

  direction.turnToward(100, 40);
  direction.turnToward(40, 40);

  assert.equal(direction.isFlipped, true);
});
