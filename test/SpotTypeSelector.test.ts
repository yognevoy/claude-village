import { test } from "node:test";
import assert from "node:assert/strict";
import { SpotTypeSelector } from "../src/domain/spots/SpotTypeSelector.js";
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
  const selector = new SpotTypeSelector(() => 0.999);
  const type = selector.select(pool({ free: 0, load: 0 }, { free: 2, load: 0 }, { free: 0, load: 0 }));
  assert.equal(type, SpotType.Forest);
});

test("select picks proportionally to free slot weight using the injected random source", () => {
  const selector = new SpotTypeSelector(() => 0);
  const type = selector.select(pool({ free: 1, load: 0 }, { free: 1, load: 0 }, { free: 1, load: 0 }));
  assert.equal(type, SpotType.Mine);
});

test("select falls into the next weighted band as the random draw grows", () => {
  const rolls = [0, 0.4, 0.9];
  let index = 0;
  const selector = new SpotTypeSelector(() => rolls[index++] as number);
  const evenPool = pool({ free: 1, load: 0 }, { free: 1, load: 0 }, { free: 1, load: 0 });

  assert.equal(selector.select(evenPool), SpotType.Mine);
  assert.equal(selector.select(evenPool), SpotType.Forest);
  assert.equal(selector.select(evenPool), SpotType.River);
});

test("select falls back to the least loaded type when nothing has a free slot", () => {
  const selector = new SpotTypeSelector(() => 0.5);
  const type = selector.select(pool({ free: 0, load: 5 }, { free: 0, load: 2 }, { free: 0, load: 5 }));
  assert.equal(type, SpotType.Forest);
});

test("select breaks load ties by enum order", () => {
  const selector = new SpotTypeSelector(() => 0.5);
  const type = selector.select(pool({ free: 0, load: 3 }, { free: 0, load: 3 }, { free: 0, load: 3 }));
  assert.equal(type, SpotType.Mine);
});
