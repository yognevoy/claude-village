import { test } from "node:test";
import assert from "node:assert/strict";
import { HookCommandEntry } from "../src/installer/HookCommandEntry.js";

test("toJSON produces a command entry with the marker as the second arg", () => {
  const entry = new HookCommandEntry("/abs/path/hook.js");
  assert.deepEqual(entry.toJSON(), {
    type: "command",
    command: "node",
    args: ["/abs/path/hook.js", "--claude-village-hook"],
  });
});

test("isOwn recognizes an entry with the marker", () => {
  assert.equal(
    HookCommandEntry.isOwn({ type: "command", command: "node", args: ["/abs/path/hook.js", "--claude-village-hook"] }),
    true,
  );
});

test("isOwn rejects a foreign command entry", () => {
  assert.equal(HookCommandEntry.isOwn({ type: "command", command: "some-other-tool" }), false);
  assert.equal(HookCommandEntry.isOwn({ type: "command", command: "node", args: ["/other/script.js"] }), false);
  assert.equal(HookCommandEntry.isOwn(null), false);
  assert.equal(HookCommandEntry.isOwn("garbage"), false);
  assert.equal(HookCommandEntry.isOwn(42), false);
});

test("matchesHookPath is true only for the same hook path", () => {
  const entry = new HookCommandEntry("/abs/path/hook.js");
  assert.equal(entry.matchesHookPath(entry.toJSON()), true);
  assert.equal(
    entry.matchesHookPath({ type: "command", command: "node", args: ["/other/path/hook.js", "--claude-village-hook"] }),
    false,
  );
});
