import type { WorkerState } from "../../domain/workers/WorkerState.js";
import type { ResourceTotals } from "../../domain/resources/ResourceTotals.js";
import { SseEvent } from "../../domain/workers/SseEvent.js";

export type ResourceTotalsView = Pick<ResourceTotals, "mine" | "forest" | "river">;

export interface EventStreamListener {
  onSnapshot(workers: readonly WorkerState[]): void;
  onDelta(worker: WorkerState): void;
  onResources(totals: ResourceTotalsView): void;
}

const RECONNECT_DELAY_MS = 2000;

export class EventStream {
  private source: EventSource | undefined;

  public constructor(
    private readonly url: string,
    private readonly listener: EventStreamListener,
  ) {
    this.connect();

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        this.reconnect();
      }
    });
  }

  public close(): void {
    this.source?.close();
  }

  private connect(): void {
    const source = new EventSource(this.url);
    this.source = source;

    source.addEventListener(SseEvent.Snapshot, (event: MessageEvent<string>) => {
      this.listener.onSnapshot(JSON.parse(event.data) as WorkerState[]);
    });

    source.addEventListener(SseEvent.Delta, (event: MessageEvent<string>) => {
      this.listener.onDelta(JSON.parse(event.data) as WorkerState);
    });

    source.addEventListener(SseEvent.Resources, (event: MessageEvent<string>) => {
      this.listener.onResources(JSON.parse(event.data) as ResourceTotalsView);
    });

    source.addEventListener("error", () => {
      if (source.readyState === EventSource.CLOSED) {
        window.setTimeout(() => this.reconnect(), RECONNECT_DELAY_MS);
      }
    });
  }

  private reconnect(): void {
    if (this.source?.readyState === EventSource.CLOSED) {
      this.connect();
    }
  }
}
