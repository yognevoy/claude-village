import type { WorkerState } from "../../domain/workers/WorkerState.js";
import type { ResourceTotals } from "../../domain/resources/ResourceTotals.js";
import { SseEvent } from "../../domain/workers/SseEvent.js";

export type ResourceTotalsView = Pick<ResourceTotals, "mine" | "forest" | "river">;

export interface EventStreamListener {
  onSnapshot(workers: readonly WorkerState[]): void;
  onDelta(worker: WorkerState): void;
  onResources(totals: ResourceTotalsView): void;
}

export class EventStream {
  private readonly source: EventSource;

  public constructor(url: string, listener: EventStreamListener) {
    this.source = new EventSource(url);

    this.source.addEventListener(SseEvent.Snapshot, (event: MessageEvent<string>) => {
      listener.onSnapshot(JSON.parse(event.data) as WorkerState[]);
    });

    this.source.addEventListener(SseEvent.Delta, (event: MessageEvent<string>) => {
      listener.onDelta(JSON.parse(event.data) as WorkerState);
    });

    this.source.addEventListener(SseEvent.Resources, (event: MessageEvent<string>) => {
      listener.onResources(JSON.parse(event.data) as ResourceTotalsView);
    });
  }

  public close(): void {
    this.source.close();
  }
}
