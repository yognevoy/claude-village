import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { FileChunkService } from "../src/infrastructure/repository/FileChunkService.js";

function withTempFile(content: string, run: (filePath: string) => void): void {
  const base = mkdtempSync(join(tmpdir(), "claude-village-file-chunk-service-test-"));
  const filePath = join(base, "events.ndjson");
  writeFileSync(filePath, content, "utf-8");
  try {
    run(filePath);
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
}

test("getSize returns null when the file does not exist", () => {
  const service = new FileChunkService();
  assert.equal(service.getSize(join(tmpdir(), "claude-village-does-not-exist.ndjson")), null);
});

test("getSize returns the byte size of an existing file", () => {
  withTempFile('{"a":1}\n', (filePath) => {
    const service = new FileChunkService();
    assert.equal(service.getSize(filePath), 8);
  });
});

test("readChunk returns exactly the requested byte range", () => {
  withTempFile('{"a":1}\n{"a":2}\n', (filePath) => {
    const service = new FileChunkService();
    assert.equal(service.readChunk(filePath, 0, 8), '{"a":1}\n');
    assert.equal(service.readChunk(filePath, 8, 8), '{"a":2}\n');
  });
});

test("truncate empties the file", () => {
  withTempFile('{"a":1}\n', (filePath) => {
    const service = new FileChunkService();
    service.truncate(filePath);
    assert.equal(service.getSize(filePath), 0);
  });
});

test("readChunk does not leak zero-padded bytes when the underlying read is short", (t) => {
  withTempFile('{"a":1}\n{"a":2}\n', (filePath) => {
    t.mock.method(fs, "readSync", (
      _fd: number,
      buffer: Buffer,
      offset: number,
      _length: number,
      _position: number,
    ): number => {
      const shortContent = '{"a":1}\n';
      buffer.write(shortContent, offset, "utf-8");
      return shortContent.length;
    });

    const service = new FileChunkService();
    const chunk = service.readChunk(filePath, 0, 17);

    assert.equal(chunk, '{"a":1}\n');
    assert.equal(chunk.includes("\0"), false);
  });
});
