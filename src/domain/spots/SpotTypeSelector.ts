import { LeastLoadedStrategy } from "./LeastLoadedStrategy.js";
import type { SelectionStrategy } from "./SelectionStrategy.js";
import type { SpotPool } from "./SpotPool.js";
import type { SpotType } from "./SpotType.js";
import { WeightedStrategy } from "./WeightedStrategy.js";

export class SpotTypeSelector {
  private readonly weighted: SelectionStrategy;
  private readonly leastLoaded: SelectionStrategy;

  public constructor(random: () => number = Math.random) {
    this.weighted = new WeightedStrategy(random);
    this.leastLoaded = new LeastLoadedStrategy();
  }

  public select(pool: SpotPool): SpotType {
    let strategy: SelectionStrategy;

    if (pool.totalFree() > 0) {
      strategy = this.weighted;
    } else {
      strategy = this.leastLoaded;
    }

    return strategy.select(pool);
  }
}
