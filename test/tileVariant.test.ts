import assert from "node:assert/strict";
import { test } from "node:test";
import { tileVariant } from "../src/shared/tileVariant.js";

test("tileVariant is deterministic for the same position", () => {
  assert.equal(tileVariant(7, 3, 3), tileVariant(7, 3, 3));
});

test("tileVariant stays within [0, variantCount)", () => {
  for (let x = 0; x < 40; x++) {
    for (let y = 0; y < 20; y++) {
      const variant = tileVariant(x, y, 3);
      assert.ok(variant >= 0 && variant < 3);
    }
  }
});

test("tileVariant produces more than one distinct value across positions", () => {
  const seen = new Set<number>();
  for (let x = 0; x < 20; x++) {
    for (let y = 0; y < 20; y++) {
      seen.add(tileVariant(x, y, 3));
    }
  }
  assert.ok(seen.size > 1);
});
