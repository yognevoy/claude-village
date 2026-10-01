import seedrandom from "seedrandom";

export function tileVariant(x: number, y: number, variantCount: number): number {
  return Math.floor(seedrandom(`${x}:${y}`)() * variantCount);
}

export function tileNoise(x: number, y: number, salt: string): number {
  return seedrandom(`${salt}:${x}:${y}`)();
}
