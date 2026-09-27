import { test } from "node:test";
import assert from "node:assert/strict";
import { Spot } from "../src/domain/spots/Spot.js";

test("freeCount is capacity minus occupied count", () => {
  const spot = new Spot(4);
  spot.enter("a");
  assert.equal(spot.freeCount(), 3);
});

test("freeCount does not go below 0", () => {
  const spot = new Spot(1);
  spot.enter("a");
  spot.enter("b");
  assert.equal(spot.freeCount(), 0);
});

test("loadCount is occupied plus queued", () => {
  const spot = new Spot(1);
  spot.enter("a");
  spot.enter("b");
  assert.equal(spot.loadCount(), 2);
});

test("enter occupies a free slot and returns true", () => {
  const spot = new Spot(1);
  assert.equal(spot.enter("a"), true);
  assert.equal(spot.freeCount(), 0);
});

test("enter queues once the slot is full and returns false", () => {
  const spot = new Spot(1);
  spot.enter("a");
  assert.equal(spot.enter("b"), false);
  assert.equal(spot.loadCount(), 2);
});

test("leave frees the slot and promotes the next queued session", () => {
  const spot = new Spot(1);
  spot.enter("a");
  spot.enter("b");

  const promoted = spot.leave("a");
  assert.equal(promoted, "b");
  assert.equal(spot.freeCount(), 0);
});

test("leave returns null when nobody is queued", () => {
  const spot = new Spot(1);
  spot.enter("a");
  assert.equal(spot.leave("a"), null);
  assert.equal(spot.freeCount(), 1);
});

test("cancel drops a queued session without touching occupancy", () => {
  const spot = new Spot(1);
  spot.enter("a");
  spot.enter("b");
  spot.enter("c");

  spot.cancel("b");
  const promoted = spot.leave("a");
  assert.equal(promoted, "c");
});
