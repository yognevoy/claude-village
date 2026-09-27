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

test("select delegates to the weighted strategy when a free slot exists somewhere", () => {
  const selector = new SpotTypeSelector(() => 0.999);
  const type = selector.select(pool({ free: 0, load: 0 }, { free: 2, load: 0 }, { free: 0, load: 0 }));
  assert.equal(type, SpotType.Forest);
});

test("select delegates to the least loaded strategy once every type is full", () => {
  const selector = new SpotTypeSelector(() => 0.5);
  const type = selector.select(pool({ free: 0, load: 5 }, { free: 0, load: 2 }, { free: 0, load: 5 }));
  assert.equal(type, SpotType.Forest);
});
