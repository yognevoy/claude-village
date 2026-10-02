import type Phaser from "phaser";
import { WorkerAnimations } from "../game/WorkerAnimations.js";
import { WorkerPhase } from "../../domain/workers/WorkerPhase.js";
import type { WorkerState } from "../../domain/workers/WorkerState.js";
import { WorkerMotion } from "./WorkerMotion.js";
import { WorkerPlacement } from "./WorkerPlacement.js";
import { TOWN_HALL_SPAWN, type Point } from "./WorldMap.js";

export class WorkerLayer {
  private readonly placement = new WorkerPlacement();
  private readonly sprites = new Map<string, Phaser.GameObjects.Sprite>();
  private readonly motions = new Map<string, WorkerMotion>();
  private readonly targets = new Map<string, Point>();
  private readonly latestWorkers = new Map<string, WorkerState>();

  public constructor(
    private readonly scene: Phaser.Scene,
    private readonly atlasKey: string,
  ) {}

  public sync(workers: readonly WorkerState[]): void {
    const sessionIds = new Set(workers.map((worker) => worker.sessionId));

    for (const sessionId of this.sprites.keys()) {
      if (!sessionIds.has(sessionId)) {
        this.remove(sessionId);
      }
    }

    for (const worker of workers) {
      this.place(worker, true);
    }
  }

  public update(worker: WorkerState): void {
    if (worker.removed || worker.phase === WorkerPhase.Gone) {
      this.remove(worker.sessionId);
      return;
    }

    this.place(worker, false);
  }

  private place(worker: WorkerState, instant: boolean): void {
    this.latestWorkers.set(worker.sessionId, worker);
    const target = this.placement.place(worker);

    let sprite = this.sprites.get(worker.sessionId);
    let motion = this.motions.get(worker.sessionId);

    if (sprite === undefined || motion === undefined) {
      const spawnPoint = instant ? target : TOWN_HALL_SPAWN;
      sprite = this.scene.add.sprite(spawnPoint.x, spawnPoint.y, this.atlasKey, WorkerAnimations.standFrame);
      sprite.setOrigin(0, 0);
      motion = new WorkerMotion(this.scene, sprite);
      this.sprites.set(worker.sessionId, sprite);
      this.motions.set(worker.sessionId, motion);
      this.targets.set(worker.sessionId, spawnPoint);
    }

    const previousTarget = this.targets.get(worker.sessionId) ?? target;
    const hasMoved = previousTarget.x !== target.x || previousTarget.y !== target.y;

    if (hasMoved) {
      this.targets.set(worker.sessionId, target);
      const sessionId = worker.sessionId;
      motion.moveTo(target, () => this.applyPose(sessionId));
      return;
    }

    if (!motion.isMoving()) {
      this.applyPose(worker.sessionId);
    }
  }

  private applyPose(sessionId: string): void {
    const sprite = this.sprites.get(sessionId);
    const worker = this.latestWorkers.get(sessionId);

    if (sprite === undefined || worker === undefined) {
      return;
    }

    if (worker.phase === WorkerPhase.AtSpot && worker.isWorking) {
      sprite.play(WorkerAnimations.workKey(worker.spotType), true);
      return;
    }

    sprite.anims.stop();
    sprite.setTexture(this.atlasKey, WorkerAnimations.standFrame);
  }

  private remove(sessionId: string): void {
    this.placement.release(sessionId);
    this.motions.get(sessionId)?.stop();
    this.motions.delete(sessionId);
    this.targets.delete(sessionId);
    this.latestWorkers.delete(sessionId);
    this.sprites.get(sessionId)?.destroy();
    this.sprites.delete(sessionId);
  }
}
