import { SpotType } from "../../domain/spots/SpotType.js";

export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface Rect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export function rectContainsPoint(rect: Rect, x: number, y: number): boolean {
  return x >= rect.x && x < rect.x + rect.width && y >= rect.y && y < rect.y + rect.height;
}

export const WORLD_WIDTH = 320;
export const WORLD_HEIGHT = 180;

export const TILE_SIZE = 8;
export const MAP_COLS = Math.ceil(WORLD_WIDTH / TILE_SIZE);
export const MAP_ROWS = Math.ceil(WORLD_HEIGHT / TILE_SIZE);

export const TOWN_HALL: Rect = { x: 136, y: 48, width: 28, height: 28 };
export const TOWN_HALL_SPAWN: Point = { x: 148, y: 78 };

export const CAMPFIRE: Rect = { x: 143, y: 82, width: 10, height: 12 };

export const MINE: Rect = { x: 16, y: 16, width: 64, height: 48 };
export const MINE_SLOTS: readonly Point[] = [
  { x: 32, y: 56 },
  { x: 56, y: 24 },
];

export const FOREST: Rect = { x: 16, y: 122, width: 80, height: 54 };
export const FOREST_SLOTS: readonly Point[] = [
  { x: 92, y: 128 },
  { x: 31, y: 159 },
];

export const RIVER_SLOTS: readonly Point[] = [
  { x: 242, y: 38 },
  { x: 254, y: 156 },
];

export const SPOT_SLOTS: Readonly<Record<SpotType, readonly Point[]>> = {
  [SpotType.Mine]: MINE_SLOTS,
  [SpotType.Forest]: FOREST_SLOTS,
  [SpotType.River]: RIVER_SLOTS,
};
