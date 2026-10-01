import assert from "node:assert/strict";
import { test } from "node:test";
import { RectOccupancy } from "../src/client/game/RectOccupancy.js";

test("accepts the first placement at any position", () => {
  const occupancy = new RectOccupancy();
  assert.equal(occupancy.claim(10, 10, 5, 5), true);
});

test("rejects a placement that overlaps an existing one", () => {
  const occupancy = new RectOccupancy();
  occupancy.claim(10, 10, 5, 5);
  assert.equal(occupancy.claim(12, 10, 5, 5), false);
});

test("accepts a placement far enough from existing ones", () => {
  const occupancy = new RectOccupancy();
  occupancy.claim(10, 10, 5, 5);
  assert.equal(occupancy.claim(30, 10, 5, 5), true);
});

test("accepts a placement exactly touching an existing one", () => {
  const occupancy = new RectOccupancy();
  occupancy.claim(10, 10, 5, 5);
  assert.equal(occupancy.claim(15, 10, 5, 5), true);
});

test("reserve always registers an obstacle, even overlapping an existing one", () => {
  const occupancy = new RectOccupancy();
  occupancy.reserve(10, 10, 5, 5);
  occupancy.reserve(12, 10, 5, 5);
  assert.equal(occupancy.claim(11, 10, 5, 5), false);
});

test("claim rejects a placement that overlaps a reserved obstacle", () => {
  const occupancy = new RectOccupancy();
  occupancy.reserve(10, 10, 5, 5);
  assert.equal(occupancy.claim(12, 10, 5, 5), false);
});
