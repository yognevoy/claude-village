import assert from "node:assert/strict";
import { test } from "node:test";
import { DEFAULT_CONFIG } from "../src/shared/config.js";
import { SpotType } from "../src/domain/spots/SpotType.js";
import {
  CAMPFIRE_SEATS,
  MINE_SLOTS,
  FOREST_SLOTS,
  RIVER_SLOTS,
  SPOT_SLOTS,
  TAVERN_TERRACE_SEATS,
  WORLD_HEIGHT,
  WORLD_WIDTH,
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
  assert.ok(withinBounds(CAMPFIRE_SEATS));
  assert.ok(withinBounds(TAVERN_TERRACE_SEATS));
});
