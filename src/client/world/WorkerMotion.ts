import Phaser from "phaser";
import type { Point } from "./WorldMap.js";
import { WorkerDirection } from "./WorkerDirection.js";

const SPEED_PX_PER_SEC = 24;

export class WorkerMotion {
  private tween: Phaser.Tweens.Tween | undefined;
  private readonly direction = new WorkerDirection();

  public constructor(
    private readonly scene: Phaser.Scene,
    private readonly container: Phaser.GameObjects.Container,
    private readonly body: Phaser.GameObjects.Sprite,
  ) {}

  public isMoving(): boolean {
    return this.tween !== undefined;
  }

  public moveTo(target: Point, walkAnimKey: string, onArrive: () => void): void {
    this.tween?.stop();

    const distance = Phaser.Math.Distance.Between(this.container.x, this.container.y, target.x, target.y);
    const duration = Math.max(1, (distance / SPEED_PX_PER_SEC) * 1000);

    this.direction.turnToward(this.container.x, target.x);
    this.body.setFlipX(this.direction.isFlipped);
    this.body.play(walkAnimKey);
    this.tween = this.scene.tweens.add({
      targets: this.container,
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
