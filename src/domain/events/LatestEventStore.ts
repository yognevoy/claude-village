import type { EventRecord } from "./EventRecord.js";

export class LatestEventStore {
  private readonly records = new Map<string, EventRecord>();

  public apply(record: EventRecord): void {
    this.records.set(record.sessionId, record);
  }

  public snapshot(): EventRecord[] {
    return Array.from(this.records.values());
  }
}
