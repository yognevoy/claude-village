import { test } from "node:test";
import assert from "node:assert/strict";
import { ResourceCounters } from "../src/domain/resources/ResourceCounters.js";
import { ResourceTotals } from "../src/domain/resources/ResourceTotals.js";
import { SpotType } from "../src/domain/spots/SpotType.js";

test("from maps each spot type to its own total", () => {
  const counters = new ResourceCounters();
  counters.increment(SpotType.Mine);
  counters.increment(SpotType.Mine);
  counters.increment(SpotType.River);

  const totals = ResourceTotals.from(counters);

  assert.equal(totals.mine, 2);
  assert.equal(totals.forest, 0);
  assert.equal(totals.river, 1);
});

test("totals read from counters keep their values after later increments", () => {
  const counters = new ResourceCounters();
  const before = ResourceTotals.from(counters);

  counters.increment(SpotType.Forest);

  assert.equal(before.forest, 0);
  assert.equal(ResourceTotals.from(counters).forest, 1);
});

test("equals is true for the same counts and false after any change", () => {
  const counters = new ResourceCounters();
  const before = ResourceTotals.from(counters);

  assert.equal(before.equals(ResourceTotals.from(counters)), true);

  counters.increment(SpotType.Forest);

  assert.equal(before.equals(ResourceTotals.from(counters)), false);
});
