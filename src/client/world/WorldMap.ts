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

export const WORLD_WIDTH = 320;
export const WORLD_HEIGHT = 180;

export const TOWN_HALL: Rect = { x: 124, y: 4, width: 58, height: 36 };
export const TOWN_HALL_SPAWN: Point = { x: 153, y: 42 };

export const MINE: Rect = { x: 14, y: 18, width: 60, height: 44 };
export const MINE_SLOTS: readonly Point[] = [
  { x: 20, y: 62 },
  { x: 36, y: 64 },
  { x: 52, y: 62 },
  { x: 66, y: 58 },
];

export const FOREST: Rect = { x: 12, y: 96, width: 60, height: 48 };
export const SAWMILL: Rect = { x: 24, y: 150, width: 28, height: 18 };
export const FOREST_SLOTS: readonly Point[] = [
  { x: 16, y: 100 },
  { x: 44, y: 96 },
  { x: 16, y: 132 },
  { x: 56, y: 120 },
];

export const RIVER: Rect = { x: 250, y: 0, width: 40, height: WORLD_HEIGHT };
export const RIVER_SLOTS: readonly Point[] = [
  { x: 246, y: 20 },
  { x: 246, y: 60 },
  { x: 246, y: 100 },
  { x: 246, y: 140 },
];

export const CAMPFIRE: Rect = { x: 144, y: 82, width: 14, height: 12 };
export const CAMPFIRE_SEATS: readonly Point[] = [
  { x: 136, y: 88 },
  { x: 164, y: 88 },
  { x: 150, y: 74 },
  { x: 150, y: 100 },
];

export const TAVERN: Rect = { x: 190, y: 130, width: 50, height: 34 };
export const TAVERN_TERRACE: Rect = { x: 244, y: 150, width: 24, height: 16 };
export const TAVERN_TERRACE_SEATS: readonly Point[] = [
  { x: 246, y: 154 },
  { x: 260, y: 154 },
  { x: 246, y: 164 },
  { x: 260, y: 164 },
];

export const SPOT_SLOTS: Readonly<Record<SpotType, readonly Point[]>> = {
  [SpotType.Mine]: MINE_SLOTS,
  [SpotType.Forest]: FOREST_SLOTS,
  [SpotType.River]: RIVER_SLOTS,
};
