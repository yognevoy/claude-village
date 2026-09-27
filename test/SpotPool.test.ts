import { test } from "node:test";
import assert from "node:assert/strict";
import { SpotPool } from "../src/domain/spots/SpotPool.js";
import { SpotType } from "../src/domain/spots/SpotType.js";

test("freeCount is capacity minus load", () => {
  const pool = new SpotPool(new Map([[SpotType.Mine, { capacity: 4, load: 1 }]]));
  assert.equal(pool.freeCount(SpotType.Mine), 3);
});

test("freeCount clamps to 0 once load reaches or exceeds capacity", () => {
  const pool = new SpotPool(new Map([[SpotType.Mine, { capacity: 4, load: 6 }]]));
  assert.equal(pool.freeCount(SpotType.Mine), 0);
});

test("freeCount defaults to 0 for a type missing from the map", () => {
  const pool = new SpotPool(new Map());
  assert.equal(pool.freeCount(SpotType.Forest), 0);
});

test("loadCount returns the raw load for a type", () => {
  const pool = new SpotPool(new Map([[SpotType.River, { capacity: 4, load: 5 }]]));
  assert.equal(pool.loadCount(SpotType.River), 5);
});

test("loadCount defaults to 0 for a type missing from the map", () => {
  const pool = new SpotPool(new Map());
  assert.equal(pool.loadCount(SpotType.Mine), 0);
});

test("totalFree sums free counts across every spot type", () => {
  const pool = new SpotPool(
    new Map([
      [SpotType.Mine, { capacity: 4, load: 3 }],
      [SpotType.Forest, { capacity: 4, load: 2 }],
      [SpotType.River, { capacity: 4, load: 4 }],
    ]),
  );
  assert.equal(pool.totalFree(), 3);
});
