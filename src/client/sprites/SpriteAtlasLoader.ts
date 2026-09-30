import { XorCodec } from "./XorCodec.js";

export interface LoadedSpriteAtlas {
  readonly image: HTMLImageElement;
  readonly json: unknown;
}

export class SpriteAtlasLoader {
  public constructor(private readonly codec: XorCodec) {}

  public async load(imageUrl: string, jsonUrl: string): Promise<LoadedSpriteAtlas> {
    const [image, json] = await Promise.all([
      this.loadImage(imageUrl),
      this.loadJson(jsonUrl),
    ]);
    return { image, json };
  }

  private async loadImage(url: string): Promise<HTMLImageElement> {
    const response = await fetch(url);
    const encoded = new Uint8Array(await response.arrayBuffer());
    const decoded = this.codec.apply(encoded);
    const blob = new Blob([decoded.buffer as ArrayBuffer], { type: "image/png" });
    const objectUrl = URL.createObjectURL(blob);
    try {
      return await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error(`failed to load sprite atlas image: ${objectUrl}`));
        image.src = objectUrl;
      });
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  private async loadJson(url: string): Promise<unknown> {
    const response = await fetch(url);
    return response.json();
  }
}
