import { getEventsFilePath } from "../../shared/paths.js";
import { DEFAULT_CONFIG } from "../../shared/config.js";
import { FileChunkService } from "./FileChunkService.js";

export class EventLineReader {
  private offsetBytes = 0;

  constructor(
    private readonly filePath: string = getEventsFilePath(),
    private readonly maxFileBytes: number = DEFAULT_CONFIG.events.maxFileBytes,
    private readonly fileChunkService: FileChunkService = new FileChunkService(),
  ) {}

  public readNewLines(): string[] {
    const size = this.fileChunkService.getSize(this.filePath);
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

    const chunk = this.fileChunkService.readChunk(this.filePath, this.offsetBytes, size - this.offsetBytes);
    const segments = chunk.split("\n");
    const completeLines = segments.slice(0, -1);

    for (const line of completeLines) {
      this.offsetBytes += Buffer.byteLength(line, "utf-8") + 1;
    }

    this.rotateIfNeeded(size);

    return completeLines;
  }

  private rotateIfNeeded(currentSize: number): void {
    if (this.offsetBytes === currentSize && currentSize > this.maxFileBytes) {
      this.fileChunkService.truncate(this.filePath);
      this.offsetBytes = 0;
    }
  }
}
