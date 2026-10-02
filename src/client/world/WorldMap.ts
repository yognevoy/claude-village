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
export const CAMPFIRE_SEATS: readonly Point[] = [
  { x: 134, y: 90 },
  { x: 162, y: 90 },
  { x: 140, y: 102 },
  { x: 154, y: 104 },
];

export const MINE: Rect = { x: 16, y: 16, width: 64, height: 48 };
export const MINE_SLOTS: readonly Point[] = [
  { x: 18, y: 68 },
  { x: 64, y: 26 },
];

export const FOREST: Rect = { x: 16, y: 122, width: 80, height: 54 };
export const FOREST_SLOTS: readonly Point[] = [
  { x: 92, y: 128 },
  { x: 31, y: 159 },
];

export const RIVER_SLOTS: readonly Point[] = [
  { x: 254, y: 36 },
  { x: 254, y: 156 },
];

export const TAVERN_TERRACE: Rect = { x: 228, y: 160, width: 50, height: 18 };
export const TAVERN_TERRACE_SEATS: readonly Point[] = [
  { x: 232, y: 164 },
  { x: 260, y: 164 },
  { x: 232, y: 174 },
  { x: 260, y: 174 },
];

export const SPOT_SLOTS: Readonly<Record<SpotType, readonly Point[]>> = {
  [SpotType.Mine]: MINE_SLOTS,
  [SpotType.Forest]: FOREST_SLOTS,
  [SpotType.River]: RIVER_SLOTS,
};
