import type { Clock } from "./Clock.js";
import type { SpotSlotsConfig } from "../../shared/config.js";
import type { EventRecord } from "../events/EventRecord.js";
import { SpotSlotRegistry } from "../spots/SpotSlotRegistry.js";
import { SpotTypeSelector } from "../spots/SpotTypeSelector.js";
import { Worker } from "./Worker.js";
import { WorkerEventDispatcher } from "./WorkerEventDispatcher.js";
import type { WorkerLifecycle } from "./WorkerEventDispatcher.js";
import { WorkerPhase } from "./WorkerPhase.js";

export class WorkerRegistry implements WorkerLifecycle {
  private readonly workers = new Map<string, Worker>();
  private readonly spotSlotRegistry: SpotSlotRegistry;
  private readonly dispatcher: WorkerEventDispatcher;

  public constructor(
    spotsConfig: SpotSlotsConfig,
    private readonly clock: Clock,
    random?: () => number,
  ) {
    const spotTypeSelector = new SpotTypeSelector(random);
    this.spotSlotRegistry = new SpotSlotRegistry(spotsConfig, spotTypeSelector);
    this.dispatcher = new WorkerEventDispatcher(this);
  }

  public list(): readonly Worker[] {
    return Array.from(this.workers.values());
  }

  public get(sessionId: string): Worker | undefined {
    return this.workers.get(sessionId);
  }

  public apply(record: EventRecord): void {
    this.dispatcher.apply(record);
  }

  public spawn(record: EventRecord): Worker {
    const existing = this.workers.get(record.sessionId);

    if (existing !== undefined) {
      return existing;
    }

    const assignment = this.spotSlotRegistry.place(record.sessionId);
    const worker = new Worker(
      record.sessionId,
      record.projectName,
      assignment.type,
      assignment.occupiesSlot,
      record.ts,
    );

    this.workers.set(record.sessionId, worker);
    return worker;
  }

  public wake(worker: Worker): void {
    if (worker.isAtSpot() || worker.isQueued()) {
      return;
    }

    const spot = this.spotSlotRegistry.of(worker.spotType);
    const occupiesSlot = spot.enter(worker.sessionId);

    if (occupiesSlot) {
      worker.setPhase(WorkerPhase.AtSpot);
    } else {
      worker.setPhase(WorkerPhase.Queued);
    }
  }

  public remove(worker: Worker): void {
    const spot = this.spotSlotRegistry.of(worker.spotType);

    if (worker.isAtSpot()) {
      const promoted = spot.leave(worker.sessionId);
      this.promote(promoted);
    } else if (worker.isQueued()) {
      spot.cancel(worker.sessionId);
    }

    this.workers.delete(worker.sessionId);
  }

  private promote(sessionId: string | null): void {
    if (sessionId === null) {
      return;
    }

    const promoted = this.workers.get(sessionId);

    if (promoted !== undefined) {
      promoted.setPhase(WorkerPhase.AtSpot);
    }
  }
}
