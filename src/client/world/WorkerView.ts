import Phaser from "phaser";
import type { SpotType } from "../../domain/spots/SpotType.js";
import { WorkerPhase } from "../../domain/workers/WorkerPhase.js";
import type { WorkerState } from "../../domain/workers/WorkerState.js";
import { WorkerAnimations } from "../game/WorkerAnimations.js";
import { WorkerMotion } from "./WorkerMotion.js";
import { WorkerSign } from "./WorkerSign.js";
import type { Point } from "./WorldMap.js";

const BODY_SIZE_PX = 8;
const SIGN_ANCHOR_X_PX = 2.5;
const SIGN_GAP_PX = 2;

export class WorkerView {
  private readonly container: Phaser.GameObjects.Container;
  private readonly body: Phaser.GameObjects.Sprite;
  private readonly sign: WorkerSign;
  private readonly motion: WorkerMotion;
  private target: Point;

  public constructor(
    scene: Phaser.Scene,
    private readonly atlasKey: string,
    spawnPoint: Point,
    spotType: SpotType,
  ) {
    this.body = scene.add.sprite(0, 0, atlasKey, WorkerAnimations.idleFrame(spotType));
    this.body.setOrigin(0, 0);

    this.sign = new WorkerSign(scene, atlasKey, SIGN_ANCHOR_X_PX, -SIGN_GAP_PX);

    this.container = scene.add.container(spawnPoint.x, spawnPoint.y, [this.body, this.sign.gameObject]);
    this.motion = new WorkerMotion(scene, this.container, this.body);
    this.target = spawnPoint;
  }

  public syncState(worker: WorkerState, target: Point): void {
    this.sign.update(worker);

    const hasMoved = this.target.x !== target.x || this.target.y !== target.y;

    if (hasMoved) {
      this.target = target;
      this.motion.moveTo(target, WorkerAnimations.walkKey(worker.spotType), () => this.pose(worker, true));
      return;
    }

    if (!this.motion.isMoving()) {
      this.pose(worker, false);
    }
  }

  public destroy(): void {
    this.motion.stop();
    this.container.destroy();
  }

  private pose(worker: WorkerState, justArrived: boolean): void {
    if (worker.phase === WorkerPhase.AtCampfire) {
      if (justArrived) {
        this.body.play(WorkerAnimations.sitKey(worker.spotType));
        return;
      }
      this.body.anims.stop();
      this.body.setTexture(this.atlasKey, WorkerAnimations.sitHoldFrame(worker.spotType));
      return;
    }

    if (worker.phase === WorkerPhase.AtSpot && worker.isWorking) {
      this.body.play(WorkerAnimations.workKey(worker.spotType), true);
      return;
    }

    this.body.play(WorkerAnimations.idleKey(worker.spotType), true);
  }
}
