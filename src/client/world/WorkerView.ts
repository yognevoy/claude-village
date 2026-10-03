import Phaser from "phaser";
import type { SpotType } from "../../domain/spots/SpotType.js";
import { WorkerPhase } from "../../domain/workers/WorkerPhase.js";
import type { WorkerState } from "../../domain/workers/WorkerState.js";
import { WorkerAnimations } from "../game/WorkerAnimations.js";
import type { NameTagOverlay } from "./NameTagOverlay.js";
import { WorkerMotion } from "./WorkerMotion.js";
import { WorkerLabel } from "./WorkerLabel.js";
import { WorkerSign } from "./WorkerSign.js";
import type { Point } from "./WorldMap.js";

const BODY_SIZE_PX = 8;
const FIGURE_CENTER_X_PX = 2.5;
const SIGN_GAP_PX = 1;
const LIFT_DURATION_MS = 150;
const TOOLTIP_GAP_PX = 2;

export interface WorkerPointerListener {
  onHoverStart(sessionId: string): void;
  onHoverEnd(sessionId: string): void;
  onPress(sessionId: string): void;
}

export class WorkerView {
  private readonly container: Phaser.GameObjects.Container;
  private readonly body: Phaser.GameObjects.Sprite;
  private readonly sign: WorkerSign;
  private readonly label: WorkerLabel;
  private readonly motion: WorkerMotion;
  private readonly tweens: Phaser.Tweens.TweenManager;
  private readonly lift = { value: 0 };
  private liftTarget = 0;
  private target: Point;
  private state: WorkerState | undefined;

  public constructor(
    scene: Phaser.Scene,
    private readonly atlasKey: string,
    spawnPoint: Point,
    spotType: SpotType,
    label: WorkerLabel,
    private readonly sessionId: string,
    private readonly pointer: WorkerPointerListener,
  ) {
    this.body = scene.add.sprite(0, 0, atlasKey, WorkerAnimations.idleFrame(spotType));
    this.body.setOrigin(0, 0);
    this.body.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, BODY_SIZE_PX, BODY_SIZE_PX),
      Phaser.Geom.Rectangle.Contains,
    );
    this.body.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
      this.pointer.onHoverStart(this.sessionId);
    });
    this.body.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
      this.pointer.onHoverEnd(this.sessionId);
    });
    this.body.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
      this.pointer.onPress(this.sessionId);
    });

    this.sign = new WorkerSign(scene, atlasKey, FIGURE_CENTER_X_PX, -SIGN_GAP_PX);
    this.label = label;
    this.tweens = scene.tweens;

    this.container = scene.add.container(spawnPoint.x, spawnPoint.y, [this.body, this.sign.gameObject]);
    this.motion = new WorkerMotion(scene, this.container, this.body);
    this.target = spawnPoint;
  }

  public get currentState(): WorkerState | undefined {
    return this.state;
  }

  public syncState(worker: WorkerState, target: Point): void {
    this.state = worker;
    this.sign.update(worker);
    this.label.update(worker);

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

  public placeOverlays(overlay: NameTagOverlay): void {
    this.followSignVisibility();

    const anchor = {
      x: this.container.x + FIGURE_CENTER_X_PX,
      y: this.container.y - this.lift.value,
    };

    this.label.moveTo(overlay.toPagePoint(anchor));
  }

  public tooltipAnchor(): Point {
    return {
      x: this.container.x + BODY_SIZE_PX + TOOLTIP_GAP_PX,
      y: this.container.y,
    };
  }

  public destroy(): void {
    this.tweens.killTweensOf(this.lift);
    this.motion.stop();
    this.container.destroy();
    this.label.destroy();
  }

  private followSignVisibility(): void {
    const target = this.sign.gameObject.visible ? this.sign.gameObject.height + SIGN_GAP_PX : 0;

    if (target === this.liftTarget) {
      return;
    }

    this.liftTarget = target;
    this.tweens.killTweensOf(this.lift);
    this.tweens.add({
      targets: this.lift,
      value: target,
      duration: LIFT_DURATION_MS,
      ease: "Sine.easeOut",
    });
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
