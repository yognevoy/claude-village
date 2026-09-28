import { test } from "node:test";
import assert from "node:assert/strict";
import { ResourceCounters } from "../src/domain/resources/ResourceCounters.js";
import { SpotType } from "../src/domain/spots/SpotType.js";

test("starts every spot type at zero", () => {
  const counters = new ResourceCounters();

  assert.equal(counters.get(SpotType.Mine), 0);
  assert.equal(counters.get(SpotType.Forest), 0);
  assert.equal(counters.get(SpotType.River), 0);
});

test("increment adds one to the given spot type only", () => {
  const counters = new ResourceCounters();

  counters.increment(SpotType.Mine);
  counters.increment(SpotType.Mine);
  counters.increment(SpotType.Forest);

  assert.equal(counters.get(SpotType.Mine), 2);
  assert.equal(counters.get(SpotType.Forest), 1);
  assert.equal(counters.get(SpotType.River), 0);
});

test("snapshot returns an independent copy of the current counts", () => {
  const counters = new ResourceCounters();
  counters.increment(SpotType.River);

  const snapshot = counters.snapshot();
  counters.increment(SpotType.River);

  assert.equal(snapshot.get(SpotType.River), 1);
  assert.equal(counters.get(SpotType.River), 2);
});
