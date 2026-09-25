import { EventRecord } from "./EventRecord.js";

export class EventLineParser {
  public parseLine(line: string): EventRecord | null {
    let parsed: unknown;
    try {
      parsed = JSON.parse(line);
    } catch {
      return null;
    }

    return EventRecord.fromRaw(parsed);
  }

  public parseLines(lines: readonly string[]): EventRecord[] {
    const records: EventRecord[] = [];
    for (const line of lines) {
      const record = this.parseLine(line);
      if (record) {
        records.push(record);
      }
    }
    return records;
  }
}
