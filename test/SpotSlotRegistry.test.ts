import { test } from "node:test";
import assert from "node:assert/strict";
import { SpotSlotRegistry } from "../src/domain/spots/SpotSlotRegistry.js";
import { SpotTypeSelector } from "../src/domain/spots/SpotTypeSelector.js";
import { SpotType } from "../src/domain/spots/SpotType.js";

function registry(): SpotSlotRegistry {
  return new SpotSlotRegistry({ mine: 1, forest: 1, river: 1 }, new SpotTypeSelector(() => 0));
}

test("place occupies a free slot for each type in weighted order", () => {
  const r = registry();
  assert.deepEqual(r.place("a"), { type: SpotType.Mine, occupiesSlot: true });
  assert.deepEqual(r.place("b"), { type: SpotType.Forest, occupiesSlot: true });
  assert.deepEqual(r.place("c"), { type: SpotType.River, occupiesSlot: true });
});

test("place queues a session once every type is full, picking the least loaded", () => {
  const r = registry();
  r.place("a");
  r.place("b");
  r.place("c");
  const assignment = r.place("d");
  assert.deepEqual(assignment, { type: SpotType.Mine, occupiesSlot: false });
});

test("of returns the same Spot instance on repeated lookups of the same type", () => {
  const r = registry();
  assert.equal(r.of(SpotType.Mine), r.of(SpotType.Mine));
});

test("of returns a different Spot instance for a different type", () => {
  const r = registry();
  assert.notEqual(r.of(SpotType.Mine), r.of(SpotType.Forest));
});

test("of throws for an unknown spot type", () => {
  const r = registry();
  assert.throws(() => r.of("unknown" as SpotType));
});
