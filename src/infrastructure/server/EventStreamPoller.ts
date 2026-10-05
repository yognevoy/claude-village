import type { Channel } from "better-sse";
import type { EventLineReader } from "../repository/EventLineReader.js";
import type { EventLineParser } from "../../domain/events/EventLineParser.js";
import type { EventRecord } from "../../domain/events/EventRecord.js";
import type { WorkerRegistry } from "../../domain/workers/WorkerRegistry.js";
import { WorkerState } from "../../domain/workers/WorkerState.js";
import { SseEvent } from "../../domain/workers/SseEvent.js";
import { ResourceTotals } from "../../domain/resources/ResourceTotals.js";

export class EventStreamPoller {
  private pollTimer: NodeJS.Timeout | undefined;

  constructor(
    private readonly reader: EventLineReader,
    private readonly parser: EventLineParser,
    private readonly registry: WorkerRegistry,
    private readonly channel: Channel,
    private readonly pollIntervalMs = 1000,
  ) {}

  public start(): void {
    this.poll();
    this.pollTimer = setInterval(() => this.poll(), this.pollIntervalMs);
  }

  public stop(): void {
    clearInterval(this.pollTimer);
  }

  private poll(): void {
    let lines: string[];
    try {
      lines = this.reader.readNewLines();
    } catch {
      return;
    }

    const records = this.parser.parseLines(lines);
    for (const record of records) {
      const totalsBefore = ResourceTotals.from(this.registry.resourceCounters);

      for (const state of this.deltas(record)) {
        this.channel.broadcast(state, SseEvent.Delta);
      }

      const totalsAfter = ResourceTotals.from(this.registry.resourceCounters);

      if (!totalsAfter.equals(totalsBefore)) {
        this.channel.broadcast(totalsAfter, SseEvent.Resources);
      }
    }
  }

  private deltas(record: EventRecord): WorkerState[] {
    const before = this.registry.get(record.sessionId);
    const { promoted } = this.registry.apply(record);
    const after = this.registry.get(record.sessionId);
    const result: WorkerState[] = [];

    if (after !== undefined) {
      result.push(WorkerState.from(after));
    } else if (before !== undefined) {
      result.push(WorkerState.from(before).asRemoved());
    }

    if (promoted !== null) {
      result.push(WorkerState.from(promoted));
    }

    return result;
  }
}
