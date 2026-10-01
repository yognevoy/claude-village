import { tileNoise } from "../../shared/tileRandom.js";

export interface LakeShape {
  readonly centerX: number;
  readonly centerY: number;
  readonly radiusX: number;
  readonly radiusY: number;
}

export const LAKE: LakeShape = { centerX: 254, centerY: 96, radiusX: 38, radiusY: 52 };

const SOLID_RADIUS = 0.85;
const EDGE_RADIUS = 1.15;
const EDGE_NOISE_THRESHOLD = 0.5;

export function isLakeTile(col: number, row: number, tileSize: number): boolean {
  const centerX = col * tileSize + tileSize / 2;
  const centerY = row * tileSize + tileSize / 2;
  const dx = (centerX - LAKE.centerX) / LAKE.radiusX;
  const dy = (centerY - LAKE.centerY) / LAKE.radiusY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance <= SOLID_RADIUS) {
    return true;
  }
  if (distance >= EDGE_RADIUS) {
    return false;
  }
  return tileNoise(col, row, "lake-edge") < EDGE_NOISE_THRESHOLD;
}
