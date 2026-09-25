import { test } from "node:test";
import assert from "node:assert/strict";
import { EventLineParser } from "../src/domain/events/EventLineParser.js";

function sampleLine(overrides: Record<string, unknown> = {}): string {
  return JSON.stringify({
    ts: 1790000000000,
    event: "PostToolUse",
    sessionId: "abc123",
    cwd: "/home/user/project",
    toolName: "Bash",
    agentId: null,
    ...overrides,
  });
}

test("parses a minimal valid line and derives projectName from cwd", () => {
  const parser = new EventLineParser();
  const record = parser.parseLine(sampleLine());
  assert.ok(record !== null);
  assert.equal(record.ts, 1790000000000);
  assert.equal(record.event, "PostToolUse");
  assert.equal(record.sessionId, "abc123");
  assert.equal(record.projectName, "project");
  assert.equal(record.toolName, "Bash");
  assert.equal(record.agentId, null);
  assert.equal(record.notificationType, null);
});

test("ignores unknown extra fields", () => {
  const parser = new EventLineParser();
  const record = parser.parseLine(sampleLine({ prompt: "delete everything", extra: 123 }));
  assert.ok(record !== null);
  assert.equal(Object.prototype.hasOwnProperty.call(record, "prompt"), false);
});

test("returns null for invalid JSON", () => {
  const parser = new EventLineParser();
  assert.equal(parser.parseLine("{not valid json"), null);
  assert.equal(parser.parseLine(""), null);
});

test("returns null for non-object JSON", () => {
  const parser = new EventLineParser();
  assert.equal(parser.parseLine("null"), null);
  assert.equal(parser.parseLine("42"), null);
  assert.equal(parser.parseLine('"garbage"'), null);
  assert.equal(parser.parseLine("[]"), null);
});

test("returns null when ts is missing or not a number", () => {
  const parser = new EventLineParser();
  assert.equal(parser.parseLine(sampleLine({ ts: undefined })), null);
  assert.equal(parser.parseLine(sampleLine({ ts: "1790000000000" })), null);
});

test("returns null for an unknown event", () => {
  const parser = new EventLineParser();
  assert.equal(parser.parseLine(sampleLine({ event: "SomeFutureEvent" })), null);
});

test("returns null when sessionId or cwd is missing", () => {
  const parser = new EventLineParser();
  assert.equal(parser.parseLine(sampleLine({ sessionId: undefined })), null);
  assert.equal(parser.parseLine(sampleLine({ cwd: undefined })), null);
});

test("defaults toolName and agentId to null when absent", () => {
  const parser = new EventLineParser();
  const record = parser.parseLine(
    JSON.stringify({ ts: 1, event: "Stop", sessionId: "abc123", cwd: "/home/user/project" }),
  );
  assert.ok(record !== null);
  assert.equal(record.toolName, null);
  assert.equal(record.agentId, null);
});

test("preserves notificationType when present as a string", () => {
  const parser = new EventLineParser();
  const record = parser.parseLine(sampleLine({ event: "Notification", notificationType: "idle_prompt" }));
  assert.ok(record !== null);
  assert.equal(record.notificationType, "idle_prompt");
});

test("parseLines skips broken lines but keeps the rest in order", () => {
  const parser = new EventLineParser();
  const lines = [sampleLine({ sessionId: "first" }), "{not valid json", sampleLine({ sessionId: "second" })];
  const records = parser.parseLines(lines);
  assert.equal(records.length, 2);
  assert.equal(records[0]?.sessionId, "first");
  assert.equal(records[1]?.sessionId, "second");
});
