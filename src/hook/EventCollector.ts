import { readFileSync } from "node:fs";
import { EventParser } from "../domain/events/EventParser.js";
import { EventRepository } from "../infrastructure/EventRepository.js";

export class EventCollector {
  constructor(
    private readonly parser: EventParser,
    private readonly repository: EventRepository,
  ) {}

  public collect(): void {
    try {
      const rawInput = readFileSync(0, "utf-8");
      const jsonPayload: unknown = JSON.parse(rawInput);

      const record = this.parser.parse(jsonPayload, Date.now());
      if (record) {
        this.repository.save(record);
      }
    } catch {
    } finally {
      process.exit(0);
    }
  }
}
