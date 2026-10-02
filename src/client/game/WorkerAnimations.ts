import type Phaser from "phaser";
import { SPOT_TYPES, type SpotType } from "../../domain/spots/SpotType.js";

const FRAME_RATE = 4;

export class WorkerAnimations {
  public static readonly standFrame = "workerStand:0:0";
  public static readonly walkKey = "worker-walk";

  public static workKey(spotType: SpotType): string {
    return `worker-work-${spotType}`;
  }

  public static register(scene: Phaser.Scene, atlasKey: string): void {
    scene.anims.create({
      key: WorkerAnimations.walkKey,
      frames: [
        { key: atlasKey, frame: "workerWalk:0:0" },
        { key: atlasKey, frame: "workerWalk:1:0" },
      ],
      frameRate: FRAME_RATE,
      repeat: -1,
    });

    SPOT_TYPES.forEach((spotType, variant) => {
      scene.anims.create({
        key: WorkerAnimations.workKey(spotType),
        frames: [
          { key: atlasKey, frame: `workerWork:0:${variant}` },
          { key: atlasKey, frame: `workerWork:1:${variant}` },
        ],
        frameRate: FRAME_RATE,
        repeat: -1,
      });
    });
  }
}
