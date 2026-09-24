import { test } from "node:test";
import assert from "node:assert/strict";
import { EventParser } from "../src/hook/EventParser.js";

test("parses a minimal record for PostToolUse", () => {
  const parser = new EventParser();
  const record = parser.parse(
    {
      hook_event_name: "PostToolUse",
      session_id: "abc123",
      cwd: "/home/user/project",
      tool_name: "Bash",
      tool_input: { command: "rm -rf /" },
      tool_response: { stdout: "secret output" },
    },
    1790000000000,
  );
  assert.deepEqual(record, {
    ts: 1790000000000,
    event: "PostToolUse",
    sessionId: "abc123",
    cwd: "/home/user/project",
    toolName: "Bash",
    agentId: null,
  });
});

test("does not leak tool_input, tool_response, prompt or transcript fields", () => {
  const parser = new EventParser();
  const record = parser.parse(
    {
      hook_event_name: "UserPromptSubmit",
      session_id: "abc123",
      cwd: "/home/user/project",
      prompt: "delete all my files",
      transcript_path: "/home/user/.claude/projects/x/y.jsonl",
    },
    1,
  );
  assert.ok(record !== null);
  assert.deepEqual(Object.keys(record).sort(), ["agentId", "cwd", "event", "sessionId", "toolName", "ts"]);
});

test("includes agentId when present", () => {
  const parser = new EventParser();
  const record = parser.parse(
    {
      hook_event_name: "SubagentStart",
      session_id: "abc123",
      cwd: "/home/user/project",
      agent_id: "a2c4b647399331676",
      agent_type: "general-purpose",
    },
    1,
  );
  assert.equal(record?.agentId, "a2c4b647399331676");
});

test("includes notificationType only for Notification events", () => {
  const parser = new EventParser();
  const record = parser.parse(
    {
      hook_event_name: "Notification",
      session_id: "abc123",
      cwd: "/home/user/project",
      notification_type: "idle_prompt",
      message: "Claude is waiting for your input",
    },
    1,
  );
  assert.equal(record?.notificationType, "idle_prompt");
  assert.equal(record && "message" in record, false);
});

test("omits notificationType for non-Notification events", () => {
  const parser = new EventParser();
  const record = parser.parse(
    {
      hook_event_name: "Stop",
      session_id: "abc123",
      cwd: "/home/user/project",
    },
    1,
  );
  assert.equal(record && "notificationType" in record, false);
});

test("returns null when session_id is missing", () => {
  const parser = new EventParser();
  const record = parser.parse(
    {
      hook_event_name: "Stop",
      cwd: "/home/user/project",
    },
    1,
  );
  assert.equal(record, null);
});

test("returns null when cwd is missing", () => {
  const parser = new EventParser();
  const record = parser.parse(
    {
      hook_event_name: "Stop",
      session_id: "abc123",
    },
    1,
  );
  assert.equal(record, null);
});

test("returns null for an unknown hook_event_name", () => {
  const parser = new EventParser();
  const record = parser.parse(
    {
      hook_event_name: "SomeFutureEvent",
      session_id: "abc123",
      cwd: "/home/user/project",
    },
    1,
  );
  assert.equal(record, null);
});

test("returns null for non-object input", () => {
  const parser = new EventParser();
  assert.equal(parser.parse(null, 1), null);
  assert.equal(parser.parse("garbage", 1), null);
  assert.equal(parser.parse(42, 1), null);
  assert.equal(parser.parse(undefined, 1), null);
});

test("returns null when fields have the wrong type", () => {
  const parser = new EventParser();
  const record = parser.parse(
    {
      hook_event_name: "Stop",
      session_id: 12345,
      cwd: "/home/user/project",
    },
    1,
  );
  assert.equal(record, null);
});
