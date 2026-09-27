import type { SelectionStrategy } from "./SelectionStrategy.js";
import type { SpotPool } from "./SpotPool.js";
import { SPOT_TYPES } from "./SpotType.js";
import type { SpotType } from "./SpotType.js";

export class LeastLoadedStrategy implements SelectionStrategy {
  public select(pool: SpotPool): SpotType {
    return SPOT_TYPES.reduce((best, candidate) => {
      if (pool.loadCount(candidate) < pool.loadCount(best)) {
        return candidate;
      }

      return best;
    });
  }
}
