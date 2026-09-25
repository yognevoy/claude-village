import { closeSync, openSync, readSync, statSync, truncateSync } from "node:fs";
import { getEventsFilePath } from "../../shared/paths.js";
import { DEFAULT_CONFIG } from "../../shared/config.js";

export class EventLineReader {
  private offsetBytes = 0;

  constructor(
    private readonly filePath: string = getEventsFilePath(),
    private readonly maxFileBytes: number = DEFAULT_CONFIG.events.maxFileBytes,
  ) {}

  public readNewLines(): string[] {
    const size = this.statSizeOrNull();
    if (size === null) {
      return [];
    }

    if (size < this.offsetBytes) {
      this.offsetBytes = 0;
    }

    if (size === this.offsetBytes) {
      this.rotateIfNeeded(size);
      return [];
    }

    const chunk = this.readChunk(this.offsetBytes, size - this.offsetBytes);
    const segments = chunk.split("\n");
    const completeLines = segments.slice(0, -1);

    for (const line of completeLines) {
      this.offsetBytes += Buffer.byteLength(line, "utf-8") + 1;
    }

    this.rotateIfNeeded(size);

    return completeLines;
  }

  private statSizeOrNull(): number | null {
    try {
      return statSync(this.filePath).size;
    } catch {
      return null;
    }
  }

  private readChunk(start: number, length: number): string {
    const fd = openSync(this.filePath, "r");
    try {
      const buffer = Buffer.alloc(length);
      readSync(fd, buffer, 0, length, start);
      return buffer.toString("utf-8");
    } finally {
      closeSync(fd);
    }
  }

  private rotateIfNeeded(currentSize: number): void {
    if (this.offsetBytes === currentSize && currentSize > this.maxFileBytes) {
      truncateSync(this.filePath, 0);
      this.offsetBytes = 0;
    }
  }
}
