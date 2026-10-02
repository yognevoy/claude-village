import type Phaser from "phaser";
import { WorkerPhase } from "../../domain/workers/WorkerPhase.js";
import type { WorkerState } from "../../domain/workers/WorkerState.js";

const ALERT_FRAME = "signExclaim:0:0";
const QUESTION_FRAME = "signQuestion:0:0";
const SLEEP_FRAME = "signSleep:0:0";

export class WorkerSign {
  public readonly gameObject: Phaser.GameObjects.Image;

  public constructor(
    scene: Phaser.Scene,
    private readonly atlasKey: string,
    x: number,
    y: number,
  ) {
    this.gameObject = scene.add.image(x, y, atlasKey, ALERT_FRAME);
    this.gameObject.setOrigin(0.5, 1);
    this.gameObject.setVisible(false);
  }

  public update(worker: WorkerState): void {
    const frame = WorkerSign.frameFor(worker);

    if (frame === null) {
      this.gameObject.setVisible(false);
      return;
    }

    this.gameObject.setTexture(this.atlasKey, frame);
    this.gameObject.setVisible(true);
  }

  private static frameFor(worker: WorkerState): string | null {
    if (worker.hasAlert) {
      return ALERT_FRAME;
    }
    if (worker.hasQuestion) {
      return QUESTION_FRAME;
    }
    if (worker.phase === WorkerPhase.AtCampfire) {
      return SLEEP_FRAME;
    }
    return null;
  }
}
