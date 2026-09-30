import Phaser from "phaser";
import atlasImageUrl from "../../../sprites/atlas.png?url";
import atlasJsonUrl from "../../../sprites/atlas.json?url";
import { RectOccupancy } from "./RectOccupancy.js";

export const SPRITE_ATLAS_KEY = "sprites";

const WORLD_WIDTH = 320;
const WORLD_HEIGHT = 180;
const PLACEMENT_ATTEMPTS = 30;

export class VillageScene extends Phaser.Scene {
  public constructor() {
    super("village");
  }

  public preload(): void {
    this.load.atlas(SPRITE_ATLAS_KEY, atlasImageUrl, atlasJsonUrl);
  }

  public create(): void {
    const occupancy = new RectOccupancy();

    for (let x = 0; x < WORLD_WIDTH; x += 8) {
      for (let y = 0; y < WORLD_HEIGHT; y += 8) {
        const variant = Phaser.Math.Between(0, 3);
        this.add.image(x, y, SPRITE_ATLAS_KEY, `grass:${variant}:0`).setOrigin(0, 0);
      }
    }

    for (let x = 264; x < WORLD_WIDTH; x += 8) {
      for (let y = 0; y < WORLD_HEIGHT; y += 8) {
        const variant = Phaser.Math.Between(0, 3);
        this.add.image(x, y, SPRITE_ATLAS_KEY, `water:${variant}:0`).setOrigin(0, 0);
      }
    }

    this.placeOne(occupancy, "townHall:0:0", 28, 28);
    this.placeOne(occupancy, "campfire:0:0", 16, 16);

    for (let i = 0; i < 14; i++) {
      const frame = Phaser.Math.Between(0, 3);
      const size = frame < 2 ? 16 : 32;
      this.placeOne(occupancy, `tree:${frame}:0`, size, size);
    }

    for (let i = 0; i < 10; i++) {
      const frame = Phaser.Math.Between(0, 2);
      this.placeOne(occupancy, `stone:${frame}:0`, 8, 8);
    }

    for (let i = 0; i < 6; i++) {
      const frame = Phaser.Math.Between(0, 2);
      this.placeOne(occupancy, `ore:${frame}:0`, 8, 8);
    }

    const poses = ["workerStand:0:0", "workerWalk:0:0", "workerWork:0:0", "workerWork:0:1", "workerWork:0:2"];
    const signs = ["signExclaim:0:0", "signQuestion:0:0", "signSleep:0:0"];
    for (let i = 0; i < 12; i++) {
      const pose = poses[Phaser.Math.Between(0, poses.length - 1)] as string;
      const spot = this.placeOne(occupancy, pose, 8, 8);
      if (spot && Phaser.Math.Between(0, 2) === 0) {
        const sign = signs[Phaser.Math.Between(0, signs.length - 1)] as string;
        this.add.image(spot.x, spot.y - 6, SPRITE_ATLAS_KEY, sign).setOrigin(0, 0);
      }
    }
  }

  private placeOne(occupancy: RectOccupancy, frameKey: string, width: number, height: number) {
    const spot = occupancy.claim(264 - width, WORLD_HEIGHT - height, width, height, PLACEMENT_ATTEMPTS);
    if (!spot) {
      return null;
    }
    this.add.image(spot.x, spot.y, SPRITE_ATLAS_KEY, frameKey).setOrigin(0, 0);
    return spot;
  }
}
