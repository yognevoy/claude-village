import { test } from "node:test";
import assert from "node:assert/strict";
import { appendFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { type Server } from "node:http";
import { EventSource } from "eventsource";
import { createChannel } from "better-sse";

interface NamedMessageEvent {
  data: string;
}
import { createHttpServer } from "../src/infrastructure/server/http-server.js";
import { EventStreamPoller } from "../src/infrastructure/server/EventStreamPoller.js";
import { EventLineReader } from "../src/infrastructure/repository/EventLineReader.js";
import { EventLineParser } from "../src/domain/events/EventLineParser.js";
import { LatestEventStore } from "../src/domain/events/LatestEventStore.js";

const TEST_PORT = 58218;
const HOST_HEADER = `127.0.0.1:${TEST_PORT}`;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

interface Harness {
  server: Server;
  poller: EventStreamPoller;
  eventsFilePath: string;
  tempDir: string;
}

async function startHarness(pollIntervalMs = 20, keepAliveMs = 20): Promise<Harness> {
  const tempDir = mkdtempSync(join(tmpdir(), "claude-village-events-route-test-"));
  const eventsFilePath = join(tempDir, "events.ndjson");
  const staticDir = mkdtempSync(join(tmpdir(), "claude-village-events-route-static-"));

  const store = new LatestEventStore();
  const channel = createChannel();
  const poller = new EventStreamPoller(
    new EventLineReader(eventsFilePath, 5_000_000),
    new EventLineParser(),
    store,
    channel,
    pollIntervalMs,
  );
  poller.start();

  const server = createHttpServer({ port: TEST_PORT, staticDir, sse: { channel, store, keepAliveMs } });
  await new Promise<void>((resolve) => server.once("listening", resolve));

  return { server, poller, eventsFilePath, tempDir };
}

async function stopHarness(harness: Harness): Promise<void> {
  harness.poller.stop();
  await new Promise<void>((resolve, reject) => {
    harness.server.close((err) => (err ? reject(err) : resolve()));
  });
  rmSync(harness.tempDir, { recursive: true, force: true });
}

function appendEventLine(filePath: string, overrides: Record<string, unknown> = {}): void {
  const line = JSON.stringify({
    ts: Date.now(),
    event: "Stop",
    sessionId: "s1",
    cwd: "/home/user/project",
    toolName: null,
    agentId: null,
    ...overrides,
  });
  appendFileSync(filePath, `${line}\n`, "utf-8");
}

function waitForNamedEvent(source: EventSource, eventName: string, timeoutMs = 2000): Promise<string> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      source.removeEventListener(eventName, onEvent);
      reject(new Error(`timed out waiting for "${eventName}"`));
    }, timeoutMs);

    function onEvent(event: NamedMessageEvent): void {
      clearTimeout(timer);
      source.removeEventListener(eventName, onEvent);
      resolve(event.data);
    }

    source.addEventListener(eventName, onEvent);
  });
}

async function waitForRawIncludes(substring: string, timeoutMs = 2000): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let buffer = "";
  try {
    const response = await fetch(`${BASE_URL}/events`, {
      headers: { Host: HOST_HEADER },
      signal: controller.signal,
    });
    if (!response.body) {
      throw new Error("no response body");
    }
    for await (const chunk of response.body) {
      buffer += Buffer.from(chunk as Uint8Array).toString("utf-8");
      if (buffer.includes(substring)) {
        return buffer;
      }
    }
  } catch (err) {
    if (!buffer.includes(substring)) {
      throw new Error(`timed out waiting for "${substring}": ${String(err)}`);
    }
  } finally {
    clearTimeout(timer);
  }
  if (!buffer.includes(substring)) {
    throw new Error(`stream ended before "${substring}" appeared`);
  }
  return buffer;
}

test("first message on a fresh connection is an empty snapshot", async () => {
  const harness = await startHarness();
  const source = new EventSource(`${BASE_URL}/events`);
  try {
    const data = await waitForNamedEvent(source, "snapshot");
    assert.deepEqual(JSON.parse(data), []);
  } finally {
    source.close();
    await stopHarness(harness);
  }
});

test("appending a line to events.ndjson produces a delta", async () => {
  const harness = await startHarness();
  const source = new EventSource(`${BASE_URL}/events`);
  try {
    await waitForNamedEvent(source, "snapshot");
    appendEventLine(harness.eventsFilePath, { sessionId: "s1", event: "Stop" });
    const data = await waitForNamedEvent(source, "delta");
    const parsed = JSON.parse(data);
    assert.equal(parsed.sessionId, "s1");
    assert.equal(parsed.event, "Stop");
    assert.equal(parsed.projectName, "project");
  } finally {
    source.close();
    await stopHarness(harness);
  }
});

test("a keep-alive comment arrives within the configured interval", async () => {
  const harness = await startHarness(20, 20);
  try {
    await waitForRawIncludes(":\n\n");
  } finally {
    await stopHarness(harness);
  }
});

test("a fresh connection after reconnect sees a snapshot with all previously known sessions", async () => {
  const harness = await startHarness();
  const sourceA = new EventSource(`${BASE_URL}/events`);
  try {
    await waitForNamedEvent(sourceA, "snapshot");
    appendEventLine(harness.eventsFilePath, { sessionId: "s1", event: "Stop" });
    await waitForNamedEvent(sourceA, "delta");
    sourceA.close();

    appendEventLine(harness.eventsFilePath, { sessionId: "s2", event: "SessionStart" });
    await sleep(200);

    const sourceB = new EventSource(`${BASE_URL}/events`);
    try {
      const data = await waitForNamedEvent(sourceB, "snapshot");
      const parsed = JSON.parse(data) as Array<{ sessionId: string }>;
      const sessionIds = parsed.map((r) => r.sessionId).sort();
      assert.deepEqual(sessionIds, ["s1", "s2"]);
    } finally {
      sourceB.close();
    }
  } finally {
    await stopHarness(harness);
  }
});

test("SSE payloads never leak the full cwd or tool I/O", async () => {
  const harness = await startHarness();
  const source = new EventSource(`${BASE_URL}/events`);
  try {
    await waitForNamedEvent(source, "snapshot");
    appendEventLine(harness.eventsFilePath, {
      sessionId: "s1",
      event: "PostToolUse",
      cwd: "/home/user/very-secret-project",
      toolName: "Bash",
    });
    const data = await waitForNamedEvent(source, "delta");
    const parsed = JSON.parse(data) as Record<string, unknown>;

    assert.equal(parsed.projectName, "very-secret-project");
    assert.equal(data.includes("/home/user"), false);
    assert.equal(Object.prototype.hasOwnProperty.call(parsed, "cwd"), false);
    assert.equal(Object.prototype.hasOwnProperty.call(parsed, "tool_input"), false);
    assert.equal(Object.prototype.hasOwnProperty.call(parsed, "tool_response"), false);
    assert.equal(Object.prototype.hasOwnProperty.call(parsed, "prompt"), false);
    for (const forbidden of ["tool_input", "tool_response", "prompt"]) {
      assert.equal(data.includes(forbidden), false);
    }
  } finally {
    source.close();
    await stopHarness(harness);
  }
});
