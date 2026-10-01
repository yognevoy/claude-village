import Phaser from "phaser";
import atlasImageUrl from "../../../sprites/atlas.png?url";
import atlasJsonUrl from "../../../sprites/atlas.json?url";
import terrainImageUrl from "../../../sprites/terrain.png?url";
import { MapRenderer } from "./MapRenderer.js";

export const SPRITE_ATLAS_KEY = "sprites";
export const TERRAIN_TILESET_KEY = "terrain";

export class VillageScene extends Phaser.Scene {
  public constructor() {
    super("village");
  }

  public preload(): void {
    this.load.atlas(SPRITE_ATLAS_KEY, atlasImageUrl, atlasJsonUrl);
    this.load.image(TERRAIN_TILESET_KEY, terrainImageUrl);
  }

  public create(): void {
    new MapRenderer(this, SPRITE_ATLAS_KEY, TERRAIN_TILESET_KEY).render();
  }
}
