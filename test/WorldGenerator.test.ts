import assert from "node:assert/strict";
import { test } from "node:test";
import { WORLD_HEIGHT, WORLD_WIDTH } from "../src/client/world/WorldMap.js";
import { WorldGenerator } from "../src/client/game/WorldGenerator.js";

test("createWorldData is deterministic across instances", () => {
  const first = new WorldGenerator().createWorldData();
  const second = new WorldGenerator().createWorldData();
  assert.deepEqual(first, second);
});

test("createWorldData includes both buildings", () => {
  const objects = new WorldGenerator().createWorldData();
  assert.ok(objects.some((obj) => obj.frame === "townHall:0:0"));
  assert.ok(objects.some((obj) => obj.frame === "campfire:0:0"));
});

test("createWorldData includes decorations beyond the buildings", () => {
  const objects = new WorldGenerator().createWorldData();
  assert.ok(objects.some((obj) => obj.frame.startsWith("tree:")));
  assert.ok(objects.some((obj) => obj.frame.startsWith("ore:") || obj.frame.startsWith("stone:")));
  assert.ok(objects.some((obj) => obj.frame.startsWith("mushroom:")));
});

test("every object sits within the world bounds", () => {
  const objects = new WorldGenerator().createWorldData();
  for (const obj of objects) {
    assert.ok(obj.x >= 0 && obj.x <= WORLD_WIDTH);
    assert.ok(obj.y >= 0 && obj.y <= WORLD_HEIGHT);
  }
});
