import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ClaudeSettingsRepository } from "../src/installer/ClaudeSettingsRepository.js";
import { InvalidSettingsError } from "../src/installer/InvalidSettingsError.js";

function tempDir(): string {
  return mkdtempSync(join(tmpdir(), "claude-village-settings-test-"));
}

test("read returns an empty object when the file does not exist", () => {
  const dir = tempDir();
  try {
    const repository = new ClaudeSettingsRepository(join(dir, "settings.json"));
    assert.deepEqual(repository.read(), {});
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("read returns the parsed object for valid JSON", () => {
  const dir = tempDir();
  const settingsPath = join(dir, "settings.json");
  writeFileSync(settingsPath, JSON.stringify({ theme: "dark" }));
  try {
    const repository = new ClaudeSettingsRepository(settingsPath);
    assert.deepEqual(repository.read(), { theme: "dark" });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("read throws InvalidSettingsError on malformed JSON", () => {
  const dir = tempDir();
  const settingsPath = join(dir, "settings.json");
  writeFileSync(settingsPath, "{not valid json");
  try {
    const repository = new ClaudeSettingsRepository(settingsPath);
    assert.throws(() => repository.read(), InvalidSettingsError);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("read throws InvalidSettingsError when JSON is not an object", () => {
  const dir = tempDir();
  const settingsPath = join(dir, "settings.json");
  writeFileSync(settingsPath, JSON.stringify([1, 2, 3]));
  try {
    const repository = new ClaudeSettingsRepository(settingsPath);
    assert.throws(() => repository.read(), InvalidSettingsError);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("write creates the file and its parent directory when missing", () => {
  const dir = tempDir();
  const settingsPath = join(dir, "nested", "settings.json");
  try {
    const repository = new ClaudeSettingsRepository(settingsPath);
    repository.write({ theme: "dark" });
    assert.deepEqual(JSON.parse(readFileSync(settingsPath, "utf-8")), { theme: "dark" });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("write does not create a backup when no file existed before", () => {
  const dir = tempDir();
  const settingsPath = join(dir, "settings.json");
  try {
    const repository = new ClaudeSettingsRepository(settingsPath);
    repository.write({ theme: "dark" });
    const backups = readdirSync(dir).filter((name) => name.includes(".backup-"));
    assert.deepEqual(backups, []);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("write backs up the previous content with a timestamp before overwriting", () => {
  const dir = tempDir();
  const settingsPath = join(dir, "settings.json");
  writeFileSync(settingsPath, JSON.stringify({ theme: "light" }));
  try {
    const repository = new ClaudeSettingsRepository(settingsPath);
    repository.write({ theme: "dark" });

    const backups = readdirSync(dir).filter((name) => name.includes(".backup-"));
    assert.equal(backups.length, 1);
    const backupContent = JSON.parse(readFileSync(join(dir, backups[0] as string), "utf-8")) as unknown;
    assert.deepEqual(backupContent, { theme: "light" });
    assert.deepEqual(JSON.parse(readFileSync(settingsPath, "utf-8")), { theme: "dark" });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("write leaves no leftover temp files behind", () => {
  const dir = tempDir();
  const settingsPath = join(dir, "settings.json");
  try {
    const repository = new ClaudeSettingsRepository(settingsPath);
    repository.write({ theme: "dark" });
    const tempFiles = readdirSync(dir).filter((name) => name.includes(".tmp-"));
    assert.deepEqual(tempFiles, []);
    assert.equal(existsSync(settingsPath), true);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
