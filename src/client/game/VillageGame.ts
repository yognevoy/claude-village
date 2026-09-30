import Phaser from "phaser";
import { WORLD_HEIGHT, WORLD_WIDTH } from "../world/WorldMap.js";
import { SPRITE_ATLAS_IMAGE_REGISTRY_KEY, SPRITE_ATLAS_JSON_REGISTRY_KEY, VillageScene } from "./VillageScene.js";

const MAX_ZOOM = 3;

export class VillageGame {
  private readonly game: Phaser.Game;

  public constructor(parent: HTMLElement, atlasImage: HTMLImageElement, atlasJson: unknown) {
    this.game = new Phaser.Game({
      type: Phaser.AUTO,
      parent,
      width: WORLD_WIDTH,
      height: WORLD_HEIGHT,
      pixelArt: true,
      backgroundColor: "#1a1a1a",
      scale: {
        mode: Phaser.Scale.NONE,
        zoom: 1,
      },
      scene: [VillageScene],
    });
    this.game.registry.set(SPRITE_ATLAS_IMAGE_REGISTRY_KEY, atlasImage);
    this.game.registry.set(SPRITE_ATLAS_JSON_REGISTRY_KEY, atlasJson);
  }

  public resize(availableWidth: number, availableHeight: number): void {
    const fitZoom = Math.floor(Math.min(availableWidth / WORLD_WIDTH, availableHeight / WORLD_HEIGHT));
    const zoom = Math.max(1, Math.min(MAX_ZOOM, fitZoom));
    this.game.scale.setZoom(zoom);
  }
}
