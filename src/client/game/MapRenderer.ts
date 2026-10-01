import Phaser from "phaser";
import { tileVariant } from "../../shared/tileRandom.js";
import { isLakeTile } from "../world/Lake.js";
import { MAP_COLS, MAP_ROWS, TILE_SIZE } from "../world/WorldMap.js";
import { MapObject } from "./features/MapObject.js";
import { WorldGenerator } from "./WorldGenerator.js";

const GRASS_VARIANT_COUNT = 4;
const WATER_VARIANT_COUNT = 4;

export class MapRenderer {
  private readonly worldGenerator = new WorldGenerator();

  public constructor(
    private readonly scene: Phaser.Scene,
    private readonly atlasKey: string,
    private readonly terrainTilesetKey: string,
  ) {}

  public render(): void {
    this.renderGroundLayer();

    const worldObjects = this.worldGenerator.createWorldData();
    for (const obj of worldObjects) {
      this.renderEntity(obj);
    }
  }

  private renderGroundLayer(): void {
    const tilemap = this.scene.make.tilemap({
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
      width: MAP_COLS,
      height: MAP_ROWS,
    });
    const tileset = tilemap.addTilesetImage(
      this.terrainTilesetKey,
      this.terrainTilesetKey,
      TILE_SIZE,
      TILE_SIZE,
    );
    if (!tileset) {
      return;
    }
    const layer = tilemap.createBlankLayer("ground", tileset);
    if (!layer) {
      return;
    }

    for (let row = 0; row < MAP_ROWS; row++) {
      for (let col = 0; col < MAP_COLS; col++) {
        const index = isLakeTile(col, row, TILE_SIZE)
          ? GRASS_VARIANT_COUNT + tileVariant(col, row, WATER_VARIANT_COUNT)
          : tileVariant(col, row, GRASS_VARIANT_COUNT);
        layer.putTileAt(index, col, row);
      }
    }
  }

  private renderEntity(obj: MapObject): void {
    this.scene.add.image(obj.x, obj.y, this.atlasKey, obj.frame).setOrigin(0, 0);
  }
}
