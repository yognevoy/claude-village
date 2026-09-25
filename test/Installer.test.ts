import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ClaudeSettingsRepository, type SettingsJson } from "../src/infrastructure/repository/ClaudeSettingsRepository.js";
import { Installer } from "../src/domain/installer/Installer.js";
import { InvalidSettingsError } from "../src/domain/installer/InvalidSettingsError.js";
import { ClaudeEvent } from "../src/domain/events/ClaudeEvent.js";

function tempDir(): string {
  return mkdtempSync(join(tmpdir(), "claude-village-installer-test-"));
}

function readSettings(path: string): SettingsJson {
  return JSON.parse(readFileSync(path, "utf-8")) as SettingsJson;
}

function createInstaller(settingsPath: string, hookPath: string): Installer {
  const repository = new ClaudeSettingsRepository(settingsPath);
  return new Installer(repository, hookPath);
}

test("install adds a command entry for every ClaudeEvent to a fresh settings file", () => {
  const dir = tempDir();
  const settingsPath = join(dir, "settings.json");
  try {
    const installer = createInstaller(settingsPath, "/abs/hook.js");
    assert.equal(installer.install(), true);

    const settings = readSettings(settingsPath);
    const hooks = settings.hooks as Record<string, unknown[]>;
    for (const event of Object.values(ClaudeEvent)) {
      assert.equal(Array.isArray(hooks[event]), true, `expected hooks for ${event}`);
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("install preserves foreign hooks on the same event and other settings keys", () => {
  const dir = tempDir();
  const settingsPath = join(dir, "settings.json");
  writeFileSync(
    settingsPath,
    JSON.stringify({
      theme: "dark",
      hooks: {
        [ClaudeEvent.PreToolUse]: [{ matcher: "Bash", hooks: [{ type: "command", command: "some-other-tool" }] }],
      },
    }),
  );
  try {
    const installer = createInstaller(settingsPath, "/abs/hook.js");
    installer.install();

    const settings = readSettings(settingsPath);
    assert.equal(settings.theme, "dark");
    const preToolUseGroups = (settings.hooks as Record<string, unknown[]>)[ClaudeEvent.PreToolUse] as Array<{
      hooks: Array<{ command: string }>;
    }>;
    assert.equal(preToolUseGroups.length, 2);
    assert.equal(preToolUseGroups[0]?.hooks[0]?.command, "some-other-tool");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("install is idempotent: running twice produces identical settings and reports no change", () => {
  const dir = tempDir();
  const settingsPath = join(dir, "settings.json");
  try {
    const installer = createInstaller(settingsPath, "/abs/hook.js");
    installer.install();
    const firstRun = readFileSync(settingsPath, "utf-8");
    assert.equal(installer.install(), false);
    const secondRun = readFileSync(settingsPath, "utf-8");
    assert.equal(firstRun, secondRun);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("install does not write a backup on the second, no-op run", () => {
  const dir = tempDir();
  const settingsPath = join(dir, "settings.json");
  try {
    const installer = createInstaller(settingsPath, "/abs/hook.js");
    installer.install();
    installer.install();
    const files = readFileSync(settingsPath, "utf-8");
    assert.ok(files.length > 0);
    const backups = readdirSync(dir).filter((name) => name.includes(".backup-"));
    assert.deepEqual(backups, []);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("install applies an update when the hook path changes", () => {
  const dir = tempDir();
  const settingsPath = join(dir, "settings.json");
  try {
    createInstaller(settingsPath, "/old/hook.js").install();
    const changed = createInstaller(settingsPath, "/new/hook.js").install();
    assert.equal(changed, true);

    const settings = readSettings(settingsPath);
    const groups = (settings.hooks as Record<string, unknown[]>)[ClaudeEvent.Stop] as Array<{
      hooks: Array<{ args: string[] }>;
    }>;
    assert.equal(groups.length, 1);
    assert.equal(groups[0]?.hooks[0]?.args[0], "/new/hook.js");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("install with invalid JSON leaves the file untouched and throws", () => {
  const dir = tempDir();
  const settingsPath = join(dir, "settings.json");
  writeFileSync(settingsPath, "{not valid json");
  try {
    const installer = createInstaller(settingsPath, "/abs/hook.js");
    assert.throws(() => installer.install(), InvalidSettingsError);
    assert.equal(readFileSync(settingsPath, "utf-8"), "{not valid json");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("uninstall removes every own entry while keeping foreign hooks", () => {
  const dir = tempDir();
  const settingsPath = join(dir, "settings.json");
  writeFileSync(
    settingsPath,
    JSON.stringify({
      hooks: {
        [ClaudeEvent.PreToolUse]: [{ matcher: "Bash", hooks: [{ type: "command", command: "some-other-tool" }] }],
      },
    }),
  );
  try {
    const installer = createInstaller(settingsPath, "/abs/hook.js");
    installer.install();
    assert.equal(installer.uninstall(), true);

    const settings = readSettings(settingsPath);
    const raw = JSON.stringify(settings.hooks);
    assert.equal(raw.includes("--claude-village-hook"), false);
    const preToolUseGroups = (settings.hooks as Record<string, unknown[]>)[ClaudeEvent.PreToolUse] as Array<{
      hooks: Array<{ command: string }>;
    }>;
    assert.equal(preToolUseGroups.length, 1);
    assert.equal(preToolUseGroups[0]?.hooks[0]?.command, "some-other-tool");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("uninstall on a file with nothing installed is a no-op", () => {
  const dir = tempDir();
  const settingsPath = join(dir, "settings.json");
  writeFileSync(settingsPath, JSON.stringify({ theme: "dark" }));
  try {
    const installer = createInstaller(settingsPath, "/abs/hook.js");
    assert.equal(installer.uninstall(), false);
    assert.deepEqual(readSettings(settingsPath), { theme: "dark" });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
