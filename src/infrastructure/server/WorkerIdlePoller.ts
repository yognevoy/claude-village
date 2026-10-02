import type { Channel } from "better-sse";
import type { WorkerIdleScheduler } from "../../domain/workers/WorkerIdleScheduler.js";
import { WorkerState } from "../../domain/workers/WorkerState.js";
import { SseEvent } from "../../domain/workers/SseEvent.js";

export class WorkerIdlePoller {
  private pollTimer: NodeJS.Timeout | undefined;

  constructor(
    private readonly scheduler: WorkerIdleScheduler,
    private readonly channel: Channel,
    private readonly pollIntervalMs = 5000,
  ) {}

  public start(): void {
    this.pollTimer = setInterval(() => this.poll(), this.pollIntervalMs);
  }

  public stop(): void {
    clearInterval(this.pollTimer);
  }

  private poll(): void {
    for (const worker of this.scheduler.tick()) {
      this.channel.broadcast(WorkerState.from(worker), SseEvent.Delta);
    }
  }
}
