import { Rect } from "../world/WorldMap.js";
import { BuildingGenerator } from "./features/BuildingGenerator.js";
import { FeatureGenerator } from "./features/FeatureGenerator.js";
import { MapObject } from "./features/MapObject.js";
import { MushroomGenerator } from "./features/MushroomGenerator.js";
import { OreGenerator } from "./features/OreGenerator.js";
import { StoneGenerator } from "./features/StoneGenerator.js";
import { TreeGenerator } from "./features/TreeGenerator.js";
import { RectOccupancy } from "./RectOccupancy.js";

const TOWN_HALL_CLEARANCE: Rect = { x: 132, y: 44, width: 36, height: 36 };
const CAMPFIRE_CLEARANCE: Rect = { x: 132, y: 72, width: 32, height: 32 };

export class WorldGenerator {
  private readonly generators: readonly FeatureGenerator[];

  public constructor() {
    this.generators = [
      new BuildingGenerator(),
      new OreGenerator(),
      new TreeGenerator(),
      new StoneGenerator(),
      new MushroomGenerator(),
    ];
  }

  public createWorldData(): MapObject[] {
    const occupancy = new RectOccupancy();
    this.reserveClearances(occupancy);

    const objects: MapObject[] = [];
    for (const generator of this.generators) {
      objects.push(...generator.generate(occupancy));
    }
    return objects;
  }

  private reserveClearances(occupancy: RectOccupancy): void {
    occupancy.reserve(
      TOWN_HALL_CLEARANCE.x,
      TOWN_HALL_CLEARANCE.y,
      TOWN_HALL_CLEARANCE.width,
      TOWN_HALL_CLEARANCE.height,
    );
    occupancy.reserve(
      CAMPFIRE_CLEARANCE.x,
      CAMPFIRE_CLEARANCE.y,
      CAMPFIRE_CLEARANCE.width,
      CAMPFIRE_CLEARANCE.height,
    );
  }
}
