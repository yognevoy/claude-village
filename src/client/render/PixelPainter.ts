export class PixelPainter {
  public constructor(private readonly ctx: CanvasRenderingContext2D) {}

  public fillRect(x: number, y: number, width: number, height: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, width, height);
  }
}
