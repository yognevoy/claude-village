import type Phaser from "phaser";
import { WorkerPhase } from "../../domain/workers/WorkerPhase.js";
import type { WorkerState } from "../../domain/workers/WorkerState.js";
import { WorkerPlacement } from "./WorkerPlacement.js";

const WORKER_FRAME = "workerStand:0:0";

export class WorkerLayer {
  private readonly placement = new WorkerPlacement();
  private readonly sprites = new Map<string, Phaser.GameObjects.Image>();

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
      this.update(worker);
    }
  }

  public update(worker: WorkerState): void {
    if (worker.removed || worker.phase === WorkerPhase.Gone) {
      this.remove(worker.sessionId);
      return;
    }

    const position = this.placement.place(worker);
    const sprite = this.sprites.get(worker.sessionId);

    if (sprite === undefined) {
      const created = this.scene.add.image(position.x, position.y, this.atlasKey, WORKER_FRAME);
      created.setOrigin(0, 0);
      this.sprites.set(worker.sessionId, created);
      return;
    }

    sprite.setPosition(position.x, position.y);
  }

  private remove(sessionId: string): void {
    this.placement.release(sessionId);
    this.sprites.get(sessionId)?.destroy();
    this.sprites.delete(sessionId);
  }
}
