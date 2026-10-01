import { Rect } from "../world/WorldMap.js";

export class RectOccupancy {
  private readonly claimed: Rect[] = [];

  public claim(x: number, y: number, width: number, height: number): boolean {
    const rect: Rect = { x, y, width, height };
    if (this.claimed.some((existing) => RectOccupancy.intersects(existing, rect))) {
      return false;
    }
    this.claimed.push(rect);
    return true;
  }

  public reserve(x: number, y: number, width: number, height: number): void {
    this.claimed.push({ x, y, width, height });
  }

  private static intersects(a: Rect, b: Rect): boolean {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
  }
}
