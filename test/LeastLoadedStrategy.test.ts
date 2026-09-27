import { test } from "node:test";
import assert from "node:assert/strict";
import { LeastLoadedStrategy } from "../src/domain/spots/LeastLoadedStrategy.js";
import { SpotPool } from "../src/domain/spots/SpotPool.js";
import { SpotType } from "../src/domain/spots/SpotType.js";

function pool(mine: number, forest: number, river: number): SpotPool {
  return new SpotPool(
    new Map([
      [SpotType.Mine, { capacity: 0, load: mine }],
      [SpotType.Forest, { capacity: 0, load: forest }],
      [SpotType.River, { capacity: 0, load: river }],
    ]),
  );
}

test("select returns the least loaded type", () => {
  const strategy = new LeastLoadedStrategy();
  const type = strategy.select(pool(5, 2, 5));
  assert.equal(type, SpotType.Forest);
});

test("select breaks load ties by enum order", () => {
  const strategy = new LeastLoadedStrategy();
  const type = strategy.select(pool(3, 3, 3));
  assert.equal(type, SpotType.Mine);
});
