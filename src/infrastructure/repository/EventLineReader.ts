import { getEventsFilePath } from "../../shared/paths.js";
import { DEFAULT_CONFIG } from "../../shared/config.js";
import { FileChunkService } from "./FileChunkService.js";

export class EventLineReader {
  private offsetBytes = 0;

  constructor(
    private readonly filePath: string = getEventsFilePath(),
    private readonly maxFileBytes: number = DEFAULT_CONFIG.events.maxFileBytes,
    private readonly chunkService: FileChunkService = new FileChunkService(),
  ) {}

  public readNewLines(): string[] {
    const size = this.chunkService.getSize(this.filePath);
    if (size === null) {
      return [];
    }

    if (size < this.offsetBytes) {
      this.offsetBytes = 0;
    }

    if (size === this.offsetBytes) {
      if (this.isFullyConsumed(size) && this.isOversized(size)) {
        this.rotate();
      }
      return [];
    }

    const chunk = this.chunkService.readChunk(this.filePath, this.offsetBytes, size - this.offsetBytes);
    const segments = chunk.split("\n");
    const lines = segments.slice(0, -1);

    for (const line of lines) {
      this.offsetBytes += Buffer.byteLength(line, "utf-8") + 1;
    }

    if (this.isFullyConsumed(size) && this.isOversized(size)) {
      this.rotate();
    }

    return lines;
  }

  private isFullyConsumed(currentSize: number): boolean {
    return this.offsetBytes === currentSize;
  }

  private isOversized(currentSize: number): boolean {
    return currentSize > this.maxFileBytes;
  }

  private rotate(): void {
    this.chunkService.truncate(this.filePath);
    this.offsetBytes = 0;
  }
}
