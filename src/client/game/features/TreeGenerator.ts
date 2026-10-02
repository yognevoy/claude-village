import { tileNoise, tileVariant } from "../../../shared/tileRandom.js";
import { isLakeTile } from "../../world/Lake.js";
import {
  CAMPFIRE,
  FOREST,
  MINE,
  Point,
  Rect,
  TILE_SIZE,
  TOWN_HALL,
  WORLD_HEIGHT,
  WORLD_WIDTH,
  rectContainsPoint,
} from "../../world/WorldMap.js";
import { RectOccupancy } from "../RectOccupancy.js";
import { FeatureGenerator } from "./FeatureGenerator.js";
import { MapObject } from "./MapObject.js";

const FOREST_TREE_STRIDE = 10;
const FOREST_TREE_DENSITY = 0.95;
const ACCENT_TREE_STRIDE = 14;
const ACCENT_TREE_DENSITY = 0.08;
const TREE_JITTER = 6;
const LAKE_NORTH_KEEPOUT: Rect = { x: 175, y: 0, width: 145, height: 44 };
const LAKE_SOUTH_KEEPOUT: Rect = { x: 160, y: 148, width: 160, height: 32 };
const TREE_EXCLUDED_RECTS: readonly Rect[] = [TOWN_HALL, CAMPFIRE, MINE, LAKE_NORTH_KEEPOUT, LAKE_SOUTH_KEEPOUT];

const CORNER_TREE_SEEDS: readonly Point[] = [
  { x: 270, y: 4 },
  { x: 236, y: 4 },
  { x: 300, y: 130 },
  { x: 296, y: 160 },
];

export class TreeGenerator implements FeatureGenerator {
  public generate(occupancy: RectOccupancy): MapObject[] {
    return [
      ...this.scatterForestTrees(occupancy),
      ...this.scatterAccentTrees(occupancy),
      ...this.placeCornerTrees(occupancy),
    ];
  }

  private scatterForestTrees(occupancy: RectOccupancy): MapObject[] {
    const objects: MapObject[] = [];
    for (let y = FOREST.y; y < FOREST.y + FOREST.height; y += FOREST_TREE_STRIDE) {
      for (let x = FOREST.x; x < FOREST.x + FOREST.width; x += FOREST_TREE_STRIDE) {
        const tree = this.tryPlaceTree(x, y, FOREST_TREE_DENSITY, "forest-tree", occupancy);
        if (tree) {
          objects.push(tree);
        }
      }
    }
    return objects;
  }

  private scatterAccentTrees(occupancy: RectOccupancy): MapObject[] {
    const objects: MapObject[] = [];
    for (let y = 0; y < WORLD_HEIGHT; y += ACCENT_TREE_STRIDE) {
      for (let x = 0; x < WORLD_WIDTH; x += ACCENT_TREE_STRIDE) {
        if (rectContainsPoint(FOREST, x, y)) {
          continue;
        }
        if (TREE_EXCLUDED_RECTS.some((rect) => rectContainsPoint(rect, x, y))) {
          continue;
        }
        const tree = this.tryPlaceTree(x, y, ACCENT_TREE_DENSITY, "accent-tree", occupancy);
        if (tree) {
          objects.push(tree);
        }
      }
    }
    return objects;
  }

  private placeCornerTrees(occupancy: RectOccupancy): MapObject[] {
    const objects: MapObject[] = [];
    for (const seed of CORNER_TREE_SEEDS) {
      const tree = this.tryPlaceTree(seed.x, seed.y, 1, "corner-tree", occupancy);
      if (tree) {
        objects.push(tree);
      }
    }
    return objects;
  }

  private tryPlaceTree(x: number, y: number, density: number, salt: string, occupancy: RectOccupancy): MapObject | null {
    if (tileNoise(x, y, `${salt}-presence`) >= density) {
      return null;
    }
    const frame = tileVariant(x, y, 4);
    const size = frame < 2 ? 16 : 32;
    const halfSize = size / 2;
    const jitterX = (tileNoise(x, y, `${salt}-x`) - 0.5) * TREE_JITTER;
    const jitterY = (tileNoise(x, y, `${salt}-y`) - 0.5) * TREE_JITTER;
    const centerX = x + halfSize + jitterX;
    const centerY = y + halfSize + jitterY;
    const left = centerX - halfSize;
    const top = centerY - halfSize;

    if (left < 0 || centerX + halfSize > WORLD_WIDTH || top < 0 || centerY + halfSize > WORLD_HEIGHT) {
      return null;
    }
    if (this.overlapsLake(left, top, size)) {
      return null;
    }
    if (!occupancy.claim(left, top, size, size)) {
      return null;
    }
    return { x: left, y: top, frame: `tree:${frame}:0` };
  }

  private overlapsLake(left: number, top: number, size: number): boolean {
    const corners: readonly [number, number][] = [
      [left, top],
      [left + size, top],
      [left, top + size],
      [left + size, top + size],
    ];
    return corners.some(([x, y]) => isLakeTile(Math.floor(x / TILE_SIZE), Math.floor(y / TILE_SIZE), TILE_SIZE));
  }
}
