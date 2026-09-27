import { test } from "node:test";
import assert from "node:assert/strict";
import { WeightedStrategy } from "../src/domain/spots/WeightedStrategy.js";
import { SpotPool, type SpotConfig } from "../src/domain/spots/SpotPool.js";
import { SpotType } from "../src/domain/spots/SpotType.js";

interface SpotState {
  free: number;
  load: number;
}

function pool(mine: SpotState, forest: SpotState, river: SpotState): SpotPool {
  const toConfig = (spot: SpotState): SpotConfig => ({ capacity: spot.free + spot.load, load: spot.load });

  return new SpotPool(
    new Map([
      [SpotType.Mine, toConfig(mine)],
      [SpotType.Forest, toConfig(forest)],
      [SpotType.River, toConfig(river)],
    ]),
  );
}

test("select returns the only type with free slots", () => {
  const strategy = new WeightedStrategy(() => 0.999);
  const type = strategy.select(pool({ free: 0, load: 0 }, { free: 2, load: 0 }, { free: 0, load: 0 }));
  assert.equal(type, SpotType.Forest);
});

test("select picks proportionally to free slot weight using the injected random source", () => {
  const strategy = new WeightedStrategy(() => 0);
  const type = strategy.select(pool({ free: 1, load: 0 }, { free: 1, load: 0 }, { free: 1, load: 0 }));
  assert.equal(type, SpotType.Mine);
});

test("select falls into the next weighted band as the random draw grows", () => {
  const rolls = [0, 0.4, 0.9];
  let index = 0;
  const strategy = new WeightedStrategy(() => rolls[index++] as number);
  const evenPool = pool({ free: 1, load: 0 }, { free: 1, load: 0 }, { free: 1, load: 0 });

  assert.equal(strategy.select(evenPool), SpotType.Mine);
  assert.equal(strategy.select(evenPool), SpotType.Forest);
  assert.equal(strategy.select(evenPool), SpotType.River);
});

test("select throws when called with no free slots", () => {
  const strategy = new WeightedStrategy(() => 0.5);
  const emptyPool = pool({ free: 0, load: 4 }, { free: 0, load: 4 }, { free: 0, load: 4 });
  assert.throws(() => strategy.select(emptyPool));
});
