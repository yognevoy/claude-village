import { SpriteId } from "./Sprite.js";

export class AtlasFrameKey {
  public constructor(
    private readonly id: SpriteId,
    private readonly frameIndex: number,
    private readonly variant: number,
  ) {}

  public toString(): string {
    return `${this.id}:${this.frameIndex}:${this.variant}`;
  }
}
