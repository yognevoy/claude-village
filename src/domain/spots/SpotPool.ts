import { SPOT_TYPES, SpotType } from "./SpotType.js";

export interface SpotConfig {
  readonly capacity: number;
  readonly load: number;
}

export class SpotPool {
  public constructor(private readonly spots: ReadonlyMap<SpotType, SpotConfig>) {}

  public loadCount(type: SpotType): number {
    return this.spots.get(type)?.load ?? 0;
  }

  public freeCount(type: SpotType): number {
    const spot = this.spots.get(type);

    if (!spot) {
      return 0;
    }

    const free = spot.capacity - spot.load;
    return free > 0 ? free : 0;
  }

  public totalFree(): number {
    return SPOT_TYPES.reduce((sum, type) => sum + this.freeCount(type), 0);
  }
}
