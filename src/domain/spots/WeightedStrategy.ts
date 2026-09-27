import type { SelectionStrategy } from "./SelectionStrategy.js";
import type { SpotPool } from "./SpotPool.js";
import { SPOT_TYPES } from "./SpotType.js";
import type { SpotType } from "./SpotType.js";

export class WeightedStrategy implements SelectionStrategy {
  public constructor(private readonly random: () => number) {}

  public select(pool: SpotPool): SpotType {
    const roll = this.random() * pool.totalFree();
    let cumulative = 0;

    const picked = SPOT_TYPES.find((type) => {
      cumulative += pool.freeCount(type);
      return roll < cumulative;
    });

    if (picked === undefined) {
      throw new Error("WeightedStrategy called with no free slots");
    }

    return picked;
  }
}
