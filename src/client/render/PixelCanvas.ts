import { WORLD_HEIGHT, WORLD_WIDTH } from "../world/WorldMap.js";

const MAX_SCALE = 3;

export class PixelCanvas {
  private readonly context: CanvasRenderingContext2D;

  public constructor(private readonly canvas: HTMLCanvasElement) {
    canvas.width = WORLD_WIDTH;
    canvas.height = WORLD_HEIGHT;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("2d canvas context unavailable");
    }
    context.imageSmoothingEnabled = false;
    this.context = context;
  }

  public getContext(): CanvasRenderingContext2D {
    return this.context;
  }

  public resize(availableWidth: number, availableHeight: number): void {
    const fitScale = Math.floor(Math.min(availableWidth / WORLD_WIDTH, availableHeight / WORLD_HEIGHT));
    const scale = Math.max(1, Math.min(MAX_SCALE, fitScale));
    this.canvas.style.width = `${WORLD_WIDTH * scale}px`;
    this.canvas.style.height = `${WORLD_HEIGHT * scale}px`;
  }
}
