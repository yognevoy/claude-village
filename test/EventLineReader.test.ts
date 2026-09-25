import { test } from "node:test";
import assert from "node:assert/strict";
import { appendFileSync, mkdtempSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { EventLineReader } from "../src/infrastructure/repository/EventLineReader.js";

function withTempDir(run: (filePath: string) => void): void {
  const base = mkdtempSync(join(tmpdir(), "claude-village-line-reader-test-"));
  const filePath = join(base, "events.ndjson");
  try {
    run(filePath);
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
}

test("returns no lines when the file does not exist", () => {
  withTempDir((filePath) => {
    const reader = new EventLineReader(filePath, 1_000_000);
    assert.deepEqual(reader.readNewLines(), []);
  });
});

test("reads complete lines and does not repeat them on the next call", () => {
  withTempDir((filePath) => {
    writeFileSync(filePath, '{"a":1}\n{"a":2}\n', "utf-8");
    const reader = new EventLineReader(filePath, 1_000_000);
    assert.deepEqual(reader.readNewLines(), ['{"a":1}', '{"a":2}']);
    assert.deepEqual(reader.readNewLines(), []);
  });
});

test("reads only newly appended lines on subsequent calls", () => {
  withTempDir((filePath) => {
    writeFileSync(filePath, '{"a":1}\n', "utf-8");
    const reader = new EventLineReader(filePath, 1_000_000);
    assert.deepEqual(reader.readNewLines(), ['{"a":1}']);

    appendFileSync(filePath, '{"a":2}\n', "utf-8");
    assert.deepEqual(reader.readNewLines(), ['{"a":2}']);
  });
});

test("withholds a line without a trailing newline until it is completed", () => {
  withTempDir((filePath) => {
    writeFileSync(filePath, '{"a":1}\n{"a":2', "utf-8");
    const reader = new EventLineReader(filePath, 1_000_000);
    assert.deepEqual(reader.readNewLines(), ['{"a":1}']);

    appendFileSync(filePath, '}\n', "utf-8");
    assert.deepEqual(reader.readNewLines(), ['{"a":2}']);
  });
});

test("recovers from external truncation without throwing or skipping new content", () => {
  withTempDir((filePath) => {
    writeFileSync(filePath, '{"a":1}\n{"a":2}\n', "utf-8");
    const reader = new EventLineReader(filePath, 1_000_000);
    assert.deepEqual(reader.readNewLines(), ['{"a":1}', '{"a":2}']);

    writeFileSync(filePath, '{"a":3}\n', "utf-8");
    assert.deepEqual(reader.readNewLines(), ['{"a":3}']);
  });
});

test("truncates the file once fully drained past maxFileBytes", () => {
  withTempDir((filePath) => {
    const line = JSON.stringify({ a: "x".repeat(20) });
    writeFileSync(filePath, `${line}\n${line}\n${line}\n`, "utf-8");
    const reader = new EventLineReader(filePath, 40);

    const lines = reader.readNewLines();
    assert.equal(lines.length, 3);
    assert.equal(statSync(filePath).size, 0);
    assert.deepEqual(reader.readNewLines(), []);
  });
});

test("does not rotate while below the configured size limit", () => {
  withTempDir((filePath) => {
    writeFileSync(filePath, '{"a":1}\n', "utf-8");
    const reader = new EventLineReader(filePath, 1_000_000);
    reader.readNewLines();
    assert.ok(statSync(filePath).size > 0);
  });
});
