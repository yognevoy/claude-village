import { tileVariant } from "../../shared/tileVariant.js";

const TILE_SIZE = 18;
const STONE_COLORS = ["#332b24", "#2b241f", "#3a3128"];
const MORTAR_COLOR = "#1a1512";
const MAX_DEVICE_PIXEL_RATIO = 2;

export class PageBackground {
  public constructor(private readonly canvas: HTMLCanvasElement) {}

  public paint(): void {
    const devicePixelRatio = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.canvas.width = width * devicePixelRatio;
    this.canvas.height = height * devicePixelRatio;

    const context = this.canvas.getContext("2d");
    if (!context) {
      return;
    }
    context.scale(devicePixelRatio, devicePixelRatio);

    for (let y = 0; y * TILE_SIZE < height; y++) {
      for (let x = 0; x * TILE_SIZE < width; x++) {
        const variant = tileVariant(x, y, STONE_COLORS.length);
        context.fillStyle = STONE_COLORS[variant] as string;
        context.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        context.fillStyle = MORTAR_COLOR;
        context.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, 1);
        context.fillRect(x * TILE_SIZE, y * TILE_SIZE, 1, TILE_SIZE);
      }
    }
  }
}
