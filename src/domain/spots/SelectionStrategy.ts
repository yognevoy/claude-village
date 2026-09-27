import type { SpotPool } from "./SpotPool.js";
import type { SpotType } from "./SpotType.js";

export interface SelectionStrategy {
  select(pool: SpotPool): SpotType;
}
