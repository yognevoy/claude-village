import { tileNoise, tileVariant } from "../../../shared/tileRandom.js";
import { isLakeTile } from "../../world/Lake.js";
import { CAMPFIRE, FOREST, MAP_COLS, MAP_ROWS, MINE, Rect, TILE_SIZE, TOWN_HALL, rectContainsPoint } from "../../world/WorldMap.js";
import { RectOccupancy } from "../RectOccupancy.js";
import { FeatureGenerator } from "./FeatureGenerator.js";
import { MapObject } from "./MapObject.js";

const MUSHROOM_DENSITY = 0.02;
const MUSHROOM_VARIANT_COUNT = 2;
const MUSHROOM_EXCLUDED_RECTS: readonly Rect[] = [TOWN_HALL, CAMPFIRE, MINE, FOREST];

export class MushroomGenerator implements FeatureGenerator {
  public generate(occupancy: RectOccupancy): MapObject[] {
    const objects: MapObject[] = [];

    for (let row = 0; row < MAP_ROWS; row++) {
      for (let col = 0; col < MAP_COLS; col++) {
        if (isLakeTile(col, row, TILE_SIZE)) {
          continue;
        }
        const x = col * TILE_SIZE;
        const y = row * TILE_SIZE;
        if (MUSHROOM_EXCLUDED_RECTS.some((rect) => rectContainsPoint(rect, x, y))) {
          continue;
        }
        if (tileNoise(col, row, "mushroom-presence") >= MUSHROOM_DENSITY) {
          continue;
        }
        if (!occupancy.claim(x, y, TILE_SIZE, TILE_SIZE)) {
          continue;
        }
        const variant = tileVariant(col, row, MUSHROOM_VARIANT_COUNT);
        objects.push({ x, y, frame: `mushroom:${variant}:0` });
      }
    }
    return objects;
  }
}
