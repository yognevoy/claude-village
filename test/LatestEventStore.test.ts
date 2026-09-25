import { test } from "node:test";
import assert from "node:assert/strict";
import { LatestEventStore } from "../src/domain/events/LatestEventStore.js";
import { EventRecord } from "../src/domain/events/EventRecord.js";

function record(sessionId: string, overrides: Record<string, unknown> = {}): EventRecord {
  const built = EventRecord.fromRaw({
    ts: 1,
    event: "Stop",
    sessionId,
    cwd: "/home/user/project",
    ...overrides,
  });
  if (!built) {
    throw new Error("failed to build EventRecord fixture");
  }
  return built;
}

test("snapshot is empty for a fresh store", () => {
  const store = new LatestEventStore();
  assert.deepEqual(store.snapshot(), []);
});

test("apply adds a record for a new session", () => {
  const store = new LatestEventStore();
  store.apply(record("abc123"));
  assert.deepEqual(store.snapshot(), [record("abc123")]);
});

test("apply overwrites the previous record for the same session", () => {
  const store = new LatestEventStore();
  store.apply(record("abc123", { event: "Stop" }));
  store.apply(record("abc123", { event: "SessionEnd" }));
  const snapshot = store.snapshot();
  assert.equal(snapshot.length, 1);
  assert.equal(snapshot[0]?.event, "SessionEnd");
});

test("tracks multiple sessions independently", () => {
  const store = new LatestEventStore();
  store.apply(record("abc123"));
  store.apply(record("def456"));
  const sessionIds = store.snapshot().map((r) => r.sessionId).sort();
  assert.deepEqual(sessionIds, ["abc123", "def456"]);
});
