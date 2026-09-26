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
import { LatestEventStore } from "../src/domain/events/LatestEventStore.js";

test("a poll that fails to read the events file does not crash the process", async () => {
  const base = mkdtempSync(join(tmpdir(), "claude-village-poller-test-"));
  const unreadablePath = join(base, "events.ndjson");
  mkdirSync(unreadablePath);

  try {
    const store = new LatestEventStore();
    const channel = createChannel();
    const reader = new EventLineReader(unreadablePath, 1_000_000);
    const poller = new EventStreamPoller(reader, new EventLineParser(), store, channel, 10);

    poller.start();
    await sleep(50);
    poller.stop();

    assert.deepEqual(store.snapshot(), []);
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
});
