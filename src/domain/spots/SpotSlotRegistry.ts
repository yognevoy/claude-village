import type { SpotSlotsConfig } from "../../shared/config.js";
import { Spot } from "./Spot.js";
import type { SpotConfig } from "./SpotPool.js";
import { SpotPool } from "./SpotPool.js";
import { SPOT_TYPES, SpotType } from "./SpotType.js";
import { SpotTypeSelector } from "./SpotTypeSelector.js";

export interface SpotAssignment {
  type: SpotType;
  occupiesSlot: boolean;
}

export class SpotSlotRegistry {
  private readonly spots: ReadonlyMap<SpotType, Spot>;

  public constructor(
    spotsConfig: SpotSlotsConfig,
    private readonly selector: SpotTypeSelector,
  ) {
    this.spots = new Map([
      [SpotType.Mine, new Spot(spotsConfig.mine)],
      [SpotType.Forest, new Spot(spotsConfig.forest)],
      [SpotType.River, new Spot(spotsConfig.river)],
    ]);
  }

  public of(type: SpotType): Spot {
    const spot = this.spots.get(type);

    if (spot === undefined) {
      throw new Error(`unknown spot type ${type}`);
    }

    return spot;
  }

  public place(sessionId: string): SpotAssignment {
    const configs = new Map<SpotType, SpotConfig>(
      SPOT_TYPES.map((type) => {
        const spot = this.of(type);
        return [type, { capacity: spot.capacity, load: spot.loadCount() }] as const;
      }),
    );
    const pool = new SpotPool(configs);

    const type = this.selector.select(pool);
    const occupiesSlot = this.of(type).enter(sessionId);

    return { type, occupiesSlot };
  }
}
