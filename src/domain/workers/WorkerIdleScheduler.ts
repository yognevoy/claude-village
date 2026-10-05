import type { Clock } from "./Clock.js";
import type { IdleThresholdsConfig, SubagentsConfig } from "../../shared/config.js";
import type { Worker } from "./Worker.js";
import { WorkerPhase } from "./WorkerPhase.js";

export interface IdleWorkerStore {
  list(): readonly Worker[];
  idle(worker: Worker, phase: WorkerPhase): Worker | null;
  rest(worker: Worker): void;
}

export class WorkerIdleScheduler {
  public constructor(
    private readonly store: IdleWorkerStore,
    private readonly clock: Clock,
    private readonly thresholds: IdleThresholdsConfig,
    private readonly subagents: SubagentsConfig,
  ) {}

  public tick(): readonly Worker[] {
    const now = this.clock.now();
    const changed = new Set<Worker>();

    for (const worker of this.store.list()) {
      const targetPhase = worker.idlePhaseAt(now, this.thresholds);

      if (targetPhase === WorkerPhase.Resting && worker.phase !== targetPhase) {
        this.store.rest(worker);
        changed.add(worker);
      } else if (targetPhase !== null && worker.phase !== targetPhase) {
        const promoted = this.store.idle(worker, targetPhase);
        changed.add(worker);

        if (promoted !== null) {
          changed.add(promoted);
        }
      }

      if (worker.subagents.pruneIdle(now, this.subagents.idleSec)) {
        changed.add(worker);
      }
    }

    return Array.from(changed);
  }
}
