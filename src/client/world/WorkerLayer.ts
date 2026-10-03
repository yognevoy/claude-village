import type Phaser from "phaser";
import { WorkerPhase } from "../../domain/workers/WorkerPhase.js";
import type { WorkerState } from "../../domain/workers/WorkerState.js";
import type { NameTagOverlay } from "./NameTagOverlay.js";
import { WorkerPlacement } from "./WorkerPlacement.js";
import { WorkerView } from "./WorkerView.js";
import { TOWN_HALL_SPAWN } from "./WorldMap.js";

export class WorkerLayer {
  private readonly placement = new WorkerPlacement();
  private readonly views = new Map<string, WorkerView>();

  public constructor(
    private readonly scene: Phaser.Scene,
    private readonly atlasKey: string,
    private readonly overlay: NameTagOverlay,
  ) {}

  public sync(workers: readonly WorkerState[]): void {
    const sessionIds = new Set(workers.map((worker) => worker.sessionId));

    for (const sessionId of this.views.keys()) {
      if (!sessionIds.has(sessionId)) {
        this.remove(sessionId);
      }
    }

    for (const worker of workers) {
      this.place(worker, true);
    }
  }

  public update(worker: WorkerState): void {
    if (worker.removed || !WorkerLayer.isVisible(worker)) {
      this.remove(worker.sessionId);
      return;
    }

    this.place(worker, false);
  }

  public refresh(): void {
    for (const view of this.views.values()) {
      view.placeOverlays(this.overlay);
    }
  }

  private static isVisible(worker: WorkerState): boolean {
    return worker.phase !== WorkerPhase.Queued && worker.phase !== WorkerPhase.Gone;
  }

  private place(worker: WorkerState, instant: boolean): void {
    if (!WorkerLayer.isVisible(worker)) {
      this.remove(worker.sessionId);
      return;
    }

    const target = this.placement.place(worker);
    let view = this.views.get(worker.sessionId);

    if (view === undefined) {
      const spawnPoint = instant ? target : TOWN_HALL_SPAWN;
      const label = this.overlay.createLabel();
      view = new WorkerView(this.scene, this.atlasKey, spawnPoint, worker.spotType, label);
      this.views.set(worker.sessionId, view);
    }

    view.syncState(worker, target);
  }

  private remove(sessionId: string): void {
    this.placement.release(sessionId);
    this.views.get(sessionId)?.destroy();
    this.views.delete(sessionId);
  }
}
