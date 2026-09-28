import { test } from "node:test";
import assert from "node:assert/strict";
import { SubagentRegistry } from "../src/domain/workers/SubagentRegistry.js";

test("count starts at zero", () => {
  const registry = new SubagentRegistry();

  assert.equal(registry.count(), 0);
});

test("touch adds a new subagent", () => {
  const registry = new SubagentRegistry();

  registry.touch("a1", 1000);

  assert.equal(registry.count(), 1);
});

test("touch on an already known subagent does not add a duplicate", () => {
  const registry = new SubagentRegistry();
  registry.touch("a1", 1000);

  registry.touch("a1", 2000);

  assert.equal(registry.count(), 1);
});

test("stop removes a subagent", () => {
  const registry = new SubagentRegistry();
  registry.touch("a1", 1000);

  registry.stop("a1");

  assert.equal(registry.count(), 0);
});

test("stop on an unknown subagent does nothing", () => {
  const registry = new SubagentRegistry();

  registry.stop("unknown");

  assert.equal(registry.count(), 0);
});

test("pruneIdle removes a subagent once it has been silent past idleSec", () => {
  const registry = new SubagentRegistry();
  registry.touch("a1", 1000);

  registry.pruneIdle(1000 + 30_000, 30);

  assert.equal(registry.count(), 0);
});

test("pruneIdle keeps a subagent that has been refreshed recently", () => {
  const registry = new SubagentRegistry();
  registry.touch("a1", 1000);

  registry.pruneIdle(1000 + 29_000, 30);

  assert.equal(registry.count(), 1);
});

test("pruneIdle evaluates each subagent independently", () => {
  const registry = new SubagentRegistry();
  registry.touch("idle", 0);
  registry.touch("fresh", 20_000);

  registry.pruneIdle(30_000, 30);

  assert.equal(registry.count(), 1);
});
