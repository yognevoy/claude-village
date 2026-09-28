import { SPOT_TYPES, SpotType } from "../spots/SpotType.js";

export class ResourceCounters {
  private readonly counts: Map<SpotType, number>;

  public constructor() {
    this.counts = new Map(
      SPOT_TYPES.map((type): [SpotType, number] => [type, 0]),
    );
  }

  public increment(type: SpotType): void {
    this.counts.set(type, this.get(type) + 1);
  }

  public get(type: SpotType): number {
    return this.counts.get(type) ?? 0;
  }

  public snapshot(): ReadonlyMap<SpotType, number> {
    return new Map(this.counts);
  }
}
