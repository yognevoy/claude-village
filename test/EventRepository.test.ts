import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { EventRepository } from "../src/hook/EventRepository.js";
import type { EventLineRecord } from "../src/hook/EventParser.types.js";

function sampleRecord(): EventLineRecord {
  return {
    ts: 1,
    event: "Stop",
    sessionId: "abc123",
    cwd: "/home/user/project",
    toolName: null,
    agentId: null,
  };
}

test("creates the parent directory if it does not exist", () => {
  const base = mkdtempSync(join(tmpdir(), "claude-village-repo-test-"));
  const filePath = join(base, "nested", "events.ndjson");
  try {
    assert.equal(existsSync(join(base, "nested")), false);
    new EventRepository(filePath).save(sampleRecord());
    assert.equal(existsSync(filePath), true);
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
});

test("appends without overwriting previous lines", () => {
  const base = mkdtempSync(join(tmpdir(), "claude-village-repo-test-"));
  const filePath = join(base, "events.ndjson");
  try {
    const repository = new EventRepository(filePath);
    repository.save(sampleRecord());
    repository.save(sampleRecord());

    const lines = readFileSync(filePath, "utf-8").trim().split("\n");
    assert.equal(lines.length, 2);
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
});

test("writes one valid JSON object per line", () => {
  const base = mkdtempSync(join(tmpdir(), "claude-village-repo-test-"));
  const filePath = join(base, "events.ndjson");
  try {
    new EventRepository(filePath).save(sampleRecord());

    const content = readFileSync(filePath, "utf-8");
    assert.equal(content.endsWith("\n"), true);
    const parsed = JSON.parse(content.trim()) as EventLineRecord;
    assert.deepEqual(parsed, sampleRecord());
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
});
