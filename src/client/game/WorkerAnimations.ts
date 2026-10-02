import type Phaser from "phaser";
import { SPOT_TYPES, type SpotType } from "../../domain/spots/SpotType.js";

const IDLE_FRAME_COUNT = 3;
const WALK_FRAME_COUNT = 4;
const SIT_FRAME_COUNT = 2;
const WORK_FRAME_COUNT = 8;

const IDLE_FRAME_RATE = 3;
const WALK_FRAME_RATE = 6;
const SIT_FRAME_RATE = 6;
const WORK_FRAME_RATE = 8;

function variantOf(spotType: SpotType): number {
  return SPOT_TYPES.indexOf(spotType);
}

function framesFor(
  atlasKey: string,
  spriteId: string,
  variant: number,
  frameCount: number,
): Phaser.Types.Animations.AnimationFrame[] {
  const frames: Phaser.Types.Animations.AnimationFrame[] = [];
  for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
    frames.push({ key: atlasKey, frame: `${spriteId}:${frameIndex}:${variant}` });
  }
  return frames;
}

export class WorkerAnimations {
  public static idleFrame(spotType: SpotType): string {
    return `workerIdle:0:${variantOf(spotType)}`;
  }

  public static sitHoldFrame(spotType: SpotType): string {
    return `workerSit:${SIT_FRAME_COUNT - 1}:${variantOf(spotType)}`;
  }

  public static idleKey(spotType: SpotType): string {
    return `worker-idle-${spotType}`;
  }

  public static walkKey(spotType: SpotType): string {
    return `worker-walk-${spotType}`;
  }

  public static sitKey(spotType: SpotType): string {
    return `worker-sit-${spotType}`;
  }

  public static workKey(spotType: SpotType): string {
    return `worker-work-${spotType}`;
  }

  public static register(scene: Phaser.Scene, atlasKey: string): void {
    SPOT_TYPES.forEach((spotType, variant) => {
      scene.anims.create({
        key: WorkerAnimations.idleKey(spotType),
        frames: framesFor(atlasKey, "workerIdle", variant, IDLE_FRAME_COUNT),
        frameRate: IDLE_FRAME_RATE,
        repeat: -1,
      });

      scene.anims.create({
        key: WorkerAnimations.walkKey(spotType),
        frames: framesFor(atlasKey, "workerWalk", variant, WALK_FRAME_COUNT),
        frameRate: WALK_FRAME_RATE,
        repeat: -1,
      });

      scene.anims.create({
        key: WorkerAnimations.sitKey(spotType),
        frames: framesFor(atlasKey, "workerSit", variant, SIT_FRAME_COUNT),
        frameRate: SIT_FRAME_RATE,
        repeat: 0,
      });

      scene.anims.create({
        key: WorkerAnimations.workKey(spotType),
        frames: framesFor(atlasKey, "workerWork", variant, WORK_FRAME_COUNT),
        frameRate: WORK_FRAME_RATE,
        repeat: -1,
      });
    });
  }
}
