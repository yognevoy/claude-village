import { appendFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { getEventsFilePath } from "../shared/paths.js";
import type { EventLineRecord } from "./EventParser.js";

export class EventRepository {
  private readonly filePath: string;

  constructor(filePath: string = getEventsFilePath()) {
    this.filePath = filePath;
  }

  public save(record: EventLineRecord): void {
    mkdirSync(dirname(this.filePath), { recursive: true });

    const line = JSON.stringify(record) + "\n";
    appendFileSync(this.filePath, line, "utf-8");
  }
}
