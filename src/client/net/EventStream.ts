import type { WorkerState } from "../../domain/workers/WorkerState.js";
import { SseEvent } from "../../domain/workers/SseEvent.js";

export interface EventStreamListener {
  onSnapshot(workers: readonly WorkerState[]): void;
  onDelta(worker: WorkerState): void;
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
  }

  public close(): void {
    this.source.close();
  }
}
