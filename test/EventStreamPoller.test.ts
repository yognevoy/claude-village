import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { createChannel } from "better-sse";
import { EventStreamPoller } from "../src/infrastructure/server/EventStreamPoller.js";
import { EventLineReader } from "../src/infrastructure/repository/EventLineReader.js";
import { EventLineParser } from "../src/domain/events/EventLineParser.js";
import { WorkerRegistry } from "../src/domain/workers/WorkerRegistry.js";
import { DEFAULT_CONFIG } from "../src/shared/config.js";

test("a poll that fails to read the events file does not crash the process", async () => {
  const base = mkdtempSync(join(tmpdir(), "claude-village-poller-test-"));
  const unreadablePath = join(base, "events.ndjson");
  mkdirSync(unreadablePath);

  try {
    const registry = new WorkerRegistry(DEFAULT_CONFIG.spots);
    const channel = createChannel();
    const reader = new EventLineReader(unreadablePath, 1_000_000);
    const poller = new EventStreamPoller(reader, new EventLineParser(), registry, channel, 10);

    poller.start();
    await sleep(50);
    poller.stop();

    assert.deepEqual(registry.list(), []);
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
});
