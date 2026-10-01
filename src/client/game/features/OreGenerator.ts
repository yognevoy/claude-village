import { tileNoise, tileVariant } from "../../../shared/tileRandom.js";
import { MINE, TILE_SIZE } from "../../world/WorldMap.js";
import { RectOccupancy } from "../RectOccupancy.js";
import { FeatureGenerator } from "./FeatureGenerator.js";
import { MapObject } from "./MapObject.js";

const ORE_DENSITY = 0.3;
const ORE_VARIANT_COUNT = 3;
const COAL_SHARE = 0.4;
const COAL_FRAME_OFFSET = 1;
const COAL_VARIANT_COUNT = 2;

export class OreGenerator implements FeatureGenerator {
  public generate(occupancy: RectOccupancy): MapObject[] {
    const objects: MapObject[] = [];
    const startCol = Math.floor(MINE.x / TILE_SIZE);
    const endCol = Math.floor((MINE.x + MINE.width) / TILE_SIZE);
    const startRow = Math.floor(MINE.y / TILE_SIZE);
    const endRow = Math.floor((MINE.y + MINE.height) / TILE_SIZE);

    for (let row = startRow; row < endRow; row++) {
      for (let col = startCol; col < endCol; col++) {
        if (tileNoise(col, row, "ore-presence") >= ORE_DENSITY) {
          continue;
        }
        const x = col * TILE_SIZE;
        const y = row * TILE_SIZE;
        if (!occupancy.claim(x, y, TILE_SIZE, TILE_SIZE)) {
          continue;
        }
        objects.push({ x, y, frame: this.pickMineralFrame(col, row) });
      }
    }
    return objects;
  }

  private pickMineralFrame(col: number, row: number): string {
    if (tileNoise(col, row, "ore-kind") < COAL_SHARE) {
      const variant = COAL_FRAME_OFFSET + tileVariant(col, row, COAL_VARIANT_COUNT);
      return `stone:${variant}:0`;
    }
    const variant = tileVariant(col, row, ORE_VARIANT_COUNT);
    return `ore:${variant}:0`;
  }
}
