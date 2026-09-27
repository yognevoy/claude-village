import type { Clock } from "./Clock.js";
import type { IdleThresholdsConfig } from "../../shared/config.js";
import type { Worker } from "./Worker.js";
import type { WorkerPhase } from "./WorkerPhase.js";

export interface IdleWorkerStore {
  list(): readonly Worker[];
  idle(worker: Worker, phase: WorkerPhase): void;
}

export class WorkerIdleScheduler {
  public constructor(
    private readonly store: IdleWorkerStore,
    private readonly clock: Clock,
    private readonly thresholds: IdleThresholdsConfig,
  ) {}

  public tick(): void {
    const now = this.clock.now();

    for (const worker of this.store.list()) {
      this.evaluate(worker, now);
    }
  }

  private evaluate(worker: Worker, now: number): void {
    const targetPhase = worker.idlePhaseAt(now, this.thresholds);

    if (targetPhase === null || worker.phase === targetPhase) {
      return;
    }

    this.store.idle(worker, targetPhase);
  }
}
