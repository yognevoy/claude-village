import type { SpotSlotsConfig } from "../../shared/config.js";
import type { EventRecord } from "../events/EventRecord.js";
import { ResourceCounters } from "../resources/ResourceCounters.js";
import { SpotSlotRegistry } from "../spots/SpotSlotRegistry.js";
import { SpotTypeSelector } from "../spots/SpotTypeSelector.js";
import { Worker } from "./Worker.js";
import { WorkerEventDispatcher } from "./WorkerEventDispatcher.js";
import type { WorkerLifecycle } from "./WorkerEventDispatcher.js";
import type { IdleWorkerStore } from "./WorkerIdleScheduler.js";
import { WorkerPhase } from "./WorkerPhase.js";
import type { EventResult } from "./EventResult.js";

export class WorkerRegistry implements WorkerLifecycle, IdleWorkerStore {
  private readonly workers = new Map<string, Worker>();
  private readonly spotSlotRegistry: SpotSlotRegistry;
  private readonly dispatcher: WorkerEventDispatcher;
  private readonly _resourceCounters: ResourceCounters;

  public constructor(spotsConfig: SpotSlotsConfig, random?: () => number) {
    const spotTypeSelector = new SpotTypeSelector(random);
    this.spotSlotRegistry = new SpotSlotRegistry(spotsConfig, spotTypeSelector);
    this._resourceCounters = new ResourceCounters();
    this.dispatcher = new WorkerEventDispatcher(this, this._resourceCounters);
  }

  public get resourceCounters(): ResourceCounters {
    return this._resourceCounters;
  }

  public list(): readonly Worker[] {
    return Array.from(this.workers.values());
  }

  public get(sessionId: string): Worker | undefined {
    return this.workers.get(sessionId);
  }

  public apply(record: EventRecord): EventResult {
    return this.dispatcher.apply(record);
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

  public remove(worker: Worker): Worker | null {
    const promoted = this.release(worker);
    this.workers.delete(worker.sessionId);
    return promoted;
  }

  public idle(worker: Worker, phase: WorkerPhase): Worker | null {
    const promoted = this.release(worker);
    worker.setPhase(phase);
    return promoted;
  }

  private release(worker: Worker): Worker | null {
    const spot = this.spotSlotRegistry.of(worker.spotType);

    if (worker.isAtSpot()) {
      const promotedId = spot.leave(worker.sessionId);

      if (promotedId === null) {
        return null;
      }

      const promoted = this.workers.get(promotedId);

      if (promoted === undefined) {
        return null;
      }

      promoted.setPhase(WorkerPhase.AtSpot);
      return promoted;
    }

    if (worker.isQueued()) {
      spot.cancel(worker.sessionId);
    }

    return null;
  }
}
