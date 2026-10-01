import { CAMPFIRE, TOWN_HALL } from "../../world/WorldMap.js";
import { FeatureGenerator } from "./FeatureGenerator.js";
import { MapObject } from "./MapObject.js";

export class BuildingGenerator implements FeatureGenerator {
  public generate(): MapObject[] {
    return [
      { x: TOWN_HALL.x, y: TOWN_HALL.y, frame: "townHall:0:0" },
      { x: CAMPFIRE.x, y: CAMPFIRE.y, frame: "campfire:0:0" },
    ];
  }
}
