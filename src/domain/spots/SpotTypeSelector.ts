import { SPOT_TYPES, SpotType } from "./SpotType.js";
import type { SpotPool } from "./SpotPool.js";

export class SpotTypeSelector {
  public constructor(private readonly random: () => number = Math.random) {}

  public select(pool: SpotPool): SpotType {
    const totalFree = pool.totalFree();

    if (totalFree > 0) {
      return this.pickWeighted(pool, totalFree);
    }

    return this.pickLeastLoaded(pool);
  }

  private pickWeighted(pool: SpotPool, totalFree: number): SpotType {
    const roll = this.random() * totalFree;

    let cumulative = 0;
    let fallback: SpotType | undefined;

    for (const type of SPOT_TYPES) {
      const weight = pool.freeCount(type);

      if (weight > 0) {
        fallback = type;
      }

      cumulative += weight;

      if (roll < cumulative) {
        return type;
      }
    }

    if (fallback === undefined) {
      throw new Error("pickWeighted called with no free slots");
    }

    return fallback;
  }

  private pickLeastLoaded(pool: SpotPool): SpotType {
    let best: SpotType | undefined;
    let bestLoad = Infinity;

    for (const type of SPOT_TYPES) {
      const load = pool.loadCount(type);

      if (load < bestLoad) {
        best = type;
        bestLoad = load;
      }
    }

    if (best === undefined) {
      throw new Error("no spot types configured");
    }

    return best;
  }
}
