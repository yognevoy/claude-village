import type { ResourceCounters } from "./ResourceCounters.js";
import { SpotType } from "../spots/SpotType.js";

export class ResourceTotals {
  private constructor(
    public readonly mine: number,
    public readonly forest: number,
    public readonly river: number,
  ) {}

  public static from(counters: ResourceCounters): ResourceTotals {
    const mine = counters.get(SpotType.Mine);
    const forest = counters.get(SpotType.Forest);
    const river = counters.get(SpotType.River);

    return new ResourceTotals(mine, forest, river);
  }

  public equals(other: ResourceTotals): boolean {
    return (
      this.mine === other.mine &&
      this.forest === other.forest &&
      this.river === other.river
    );
  }
}
