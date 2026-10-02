import { tileNoise } from "../../../shared/tileRandom.js";
import { isLakeTile } from "../../world/Lake.js";
import { CAMPFIRE, FOREST, MAP_COLS, MAP_ROWS, MINE, Rect, TILE_SIZE, TOWN_HALL, rectContainsPoint } from "../../world/WorldMap.js";
import { RectOccupancy } from "../RectOccupancy.js";
import { FeatureGenerator } from "./FeatureGenerator.js";
import { MapObject } from "./MapObject.js";

const STONE_DENSITY = 0.035;
const STONE_FRAME = "stone:0:0";
const STONE_EXCLUDED_RECTS: readonly Rect[] = [TOWN_HALL, CAMPFIRE, MINE, FOREST];

export class StoneGenerator implements FeatureGenerator {
  public generate(occupancy: RectOccupancy): MapObject[] {
    const objects: MapObject[] = [];

    for (let row = 0; row < MAP_ROWS; row++) {
      for (let col = 0; col < MAP_COLS; col++) {
        if (isLakeTile(col, row, TILE_SIZE)) {
          continue;
        }
        const x = col * TILE_SIZE;
        const y = row * TILE_SIZE;
        if (STONE_EXCLUDED_RECTS.some((rect) => rectContainsPoint(rect, x, y))) {
          continue;
        }
        if (tileNoise(col, row, "stone-presence") >= STONE_DENSITY) {
          continue;
        }
        if (!occupancy.claim(x, y, TILE_SIZE, TILE_SIZE)) {
          continue;
        }
        objects.push({ x, y, frame: STONE_FRAME });
      }
    }
    return objects;
  }
}
