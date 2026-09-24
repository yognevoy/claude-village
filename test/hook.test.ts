import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const tsxCliPath = require.resolve("tsx/cli");
const testDir = fileURLToPath(new URL(".", import.meta.url));
const hookPath = join(testDir, "..", "src", "hook", "hook.ts");

function runHook(input: string, home: string): { stdout: string; stderr: string; status: number | null } {
  const result = spawnSync(process.execPath, [tsxCliPath, hookPath], {
    input,
    encoding: "utf-8",
    env: { ...process.env, HOME: home, USERPROFILE: home },
  });
  return { stdout: result.stdout, stderr: result.stderr, status: result.status };
}

function eventsFilePath(home: string): string {
  return join(home, ".claude-village", "events.ndjson");
}

test("valid stdin is appended as one minimal line", () => {
  const home = mkdtempSync(join(tmpdir(), "claude-village-hook-test-"));
  try {
    const result = runHook(
      JSON.stringify({
        hook_event_name: "PostToolUse",
        session_id: "abc123",
        cwd: "/home/user/project",
        tool_name: "Bash",
        tool_input: { command: "rm -rf /" },
      }),
      home,
    );
    assert.equal(result.status, 0);
    assert.equal(result.stdout, "");
    assert.equal(result.stderr, "");

    const content = readFileSync(eventsFilePath(home), "utf-8");
    const lines = content.trim().split("\n");
    assert.equal(lines.length, 1);
    const parsed = JSON.parse(lines[0] as string) as Record<string, unknown>;
    assert.equal(parsed["event"], "PostToolUse");
    assert.equal(parsed["sessionId"], "abc123");
    assert.equal(parsed["toolName"], "Bash");
    assert.equal("tool_input" in parsed, false);
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});

test("malformed JSON exits 0 with no output and no file", () => {
  const home = mkdtempSync(join(tmpdir(), "claude-village-hook-test-"));
  try {
    const result = runHook("{not valid json", home);
    assert.equal(result.status, 0);
    assert.equal(result.stdout, "");
    assert.equal(result.stderr, "");
    assert.throws(() => readFileSync(eventsFilePath(home), "utf-8"));
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});

test("empty stdin exits 0 with no output", () => {
  const home = mkdtempSync(join(tmpdir(), "claude-village-hook-test-"));
  try {
    const result = runHook("", home);
    assert.equal(result.status, 0);
    assert.equal(result.stdout, "");
    assert.equal(result.stderr, "");
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});

test("two invocations append two lines", () => {
  const home = mkdtempSync(join(tmpdir(), "claude-village-hook-test-"));
  try {
    const payload = JSON.stringify({
      hook_event_name: "Stop",
      session_id: "abc123",
      cwd: "/home/user/project",
    });
    runHook(payload, home);
    runHook(payload, home);

    const content = readFileSync(eventsFilePath(home), "utf-8");
    const lines = content.trim().split("\n");
    assert.equal(lines.length, 2);
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});
