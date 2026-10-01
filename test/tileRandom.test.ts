import assert from "node:assert/strict";
import { test } from "node:test";
import { tileNoise, tileVariant } from "../src/shared/tileRandom.js";

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

test("tileNoise is deterministic for the same position and salt", () => {
  assert.equal(tileNoise(7, 3, "stone"), tileNoise(7, 3, "stone"));
});

test("tileNoise stays within [0, 1)", () => {
  for (let x = 0; x < 20; x++) {
    for (let y = 0; y < 20; y++) {
      const value = tileNoise(x, y, "stone");
      assert.ok(value >= 0 && value < 1);
    }
  }
});

test("tileNoise produces more than one distinct value across positions", () => {
  const seen = new Set<number>();
  for (let x = 0; x < 20; x++) {
    for (let y = 0; y < 20; y++) {
      seen.add(tileNoise(x, y, "stone"));
    }
  }
  assert.ok(seen.size > 1);
});

test("tileNoise differs by salt for the same position", () => {
  let differingPairs = 0;
  for (let x = 0; x < 10; x++) {
    for (let y = 0; y < 10; y++) {
      if (tileNoise(x, y, "tree") !== tileNoise(x, y, "stone")) {
        differingPairs++;
      }
    }
  }
  assert.ok(differingPairs > 0);
});
