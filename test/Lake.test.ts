import assert from "node:assert/strict";
import { test } from "node:test";
import { isLakeTile, LAKE } from "../src/client/world/Lake.js";

const TILE_SIZE = 8;

test("isLakeTile is deterministic for the same position", () => {
  assert.equal(isLakeTile(29, 10, TILE_SIZE), isLakeTile(29, 10, TILE_SIZE));
});

test("the lake center tile is water", () => {
  const col = Math.floor(LAKE.centerX / TILE_SIZE);
  const row = Math.floor(LAKE.centerY / TILE_SIZE);
  assert.equal(isLakeTile(col, row, TILE_SIZE), true);
});

test("a tile far from the lake is not water", () => {
  assert.equal(isLakeTile(0, 0, TILE_SIZE), false);
});

test("the lake edge band is irregular, not a smooth ellipse", () => {
  const results = new Set<boolean>();
  for (let col = 20; col < 40; col++) {
    results.add(isLakeTile(col, 12, TILE_SIZE));
  }
  assert.ok(results.has(true) && results.has(false));
});
