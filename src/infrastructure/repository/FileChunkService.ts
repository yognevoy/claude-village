import fs from "node:fs";

export class FileChunkService {
  public getSize(path: string): number | null {
    try {
      return fs.statSync(path).size;
    } catch {
      return null;
    }
  }

  public readChunk(path: string, start: number, length: number): string {
    const fd = fs.openSync(path, "r");
    try {
      const buffer = Buffer.alloc(length);
      const bytesRead = fs.readSync(fd, buffer, 0, length, start);
      return buffer.toString("utf-8", 0, bytesRead);
    } finally {
      fs.closeSync(fd);
    }
  }

  public truncate(path: string): void {
    fs.truncateSync(path, 0);
  }
}
