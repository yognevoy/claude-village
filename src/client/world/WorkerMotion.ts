import Phaser from "phaser";
import { WorkerAnimations } from "../game/WorkerAnimations.js";
import type { Point } from "./WorldMap.js";

const SPEED_PX_PER_SEC = 24;

export class WorkerMotion {
  private tween: Phaser.Tweens.Tween | undefined;

  public constructor(
    private readonly scene: Phaser.Scene,
    private readonly sprite: Phaser.GameObjects.Sprite,
  ) {}

  public isMoving(): boolean {
    return this.tween !== undefined;
  }

  public moveTo(target: Point, onArrive: () => void): void {
    this.tween?.stop();

    const distance = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, target.x, target.y);
    const duration = Math.max(1, (distance / SPEED_PX_PER_SEC) * 1000);

    this.sprite.play(WorkerAnimations.walkKey);
    this.tween = this.scene.tweens.add({
      targets: this.sprite,
      x: target.x,
      y: target.y,
      duration,
      onComplete: () => {
        this.tween = undefined;
        onArrive();
      },
    });
  }

  public stop(): void {
    this.tween?.stop();
    this.tween = undefined;
  }
}
