import Phaser from "phaser";

export interface Rect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export class RectOccupancy {
  private readonly claimed: Rect[] = [];

  public claim(maxX: number, maxY: number, width: number, height: number, maxAttempts: number): Rect | null {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const candidate: Rect = {
        x: Phaser.Math.Between(0, maxX),
        y: Phaser.Math.Between(0, maxY),
        width,
        height,
      };
      if (this.place(candidate)) {
        return candidate;
      }
    }
    return null;
  }

  private place(rect: Rect): boolean {
    if (this.claimed.some((existing) => RectOccupancy.intersects(existing, rect))) {
      return false;
    }
    this.claimed.push(rect);
    return true;
  }

  private static intersects(a: Rect, b: Rect): boolean {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
  }
}
