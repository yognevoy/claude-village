import type { Channel } from "better-sse";
import type { EventLineReader } from "../repository/EventLineReader.js";
import type { EventLineParser } from "../../domain/events/EventLineParser.js";
import type { LatestEventStore } from "../../domain/events/LatestEventStore.js";

export class EventStreamPoller {
  private pollTimer: NodeJS.Timeout | undefined;

  constructor(
    private readonly reader: EventLineReader,
    private readonly parser: EventLineParser,
    private readonly store: LatestEventStore,
    private readonly channel: Channel,
    private readonly pollIntervalMs = 1000,
  ) {}

  public start(): void {
    this.pollTimer = setInterval(() => this.poll(), this.pollIntervalMs);
  }

  public stop(): void {
    clearInterval(this.pollTimer);
  }

  private poll(): void {
    const lines = this.reader.readNewLines();
    const records = this.parser.parseLines(lines);
    for (const record of records) {
      this.store.apply(record);
      this.channel.broadcast(record, "delta");
    }
  }
}
