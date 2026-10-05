import assert from "node:assert/strict";
import { test } from "node:test";
import { DEFAULT_CONFIG } from "../src/shared/config.js";
import { SpotType } from "../src/domain/spots/SpotType.js";
import {
  MINE_SLOTS,
  FOREST_SLOTS,
  RIVER_SLOTS,
  SPOT_SLOTS,
  WORLD_HEIGHT,
  WORLD_WIDTH,
  rectContainsPoint,
} from "../src/client/world/WorldMap.js";

function withinBounds(points: readonly { x: number; y: number }[]): boolean {
  return points.every((point) => point.x >= 0 && point.x < WORLD_WIDTH && point.y >= 0 && point.y < WORLD_HEIGHT);
}

test("spot slot anchor counts match the default config slot counts", () => {
  assert.equal(MINE_SLOTS.length, DEFAULT_CONFIG.spots.mine);
  assert.equal(FOREST_SLOTS.length, DEFAULT_CONFIG.spots.forest);
  assert.equal(RIVER_SLOTS.length, DEFAULT_CONFIG.spots.river);
});

test("SPOT_SLOTS covers every domain spot type", () => {
  assert.equal(SPOT_SLOTS[SpotType.Mine], MINE_SLOTS);
  assert.equal(SPOT_SLOTS[SpotType.Forest], FOREST_SLOTS);
  assert.equal(SPOT_SLOTS[SpotType.River], RIVER_SLOTS);
});

test("all anchor points sit within the world bounds", () => {
  assert.ok(withinBounds(MINE_SLOTS));
  assert.ok(withinBounds(FOREST_SLOTS));
  assert.ok(withinBounds(RIVER_SLOTS));
});

test("rectContainsPoint treats the rect as half-open", () => {
  const rect = { x: 10, y: 10, width: 4, height: 4 };
  assert.equal(rectContainsPoint(rect, 10, 10), true);
  assert.equal(rectContainsPoint(rect, 13, 13), true);
  assert.equal(rectContainsPoint(rect, 14, 10), false);
  assert.equal(rectContainsPoint(rect, 10, 14), false);
  assert.equal(rectContainsPoint(rect, 9, 10), false);
});
