import { homedir } from "node:os";
import { join } from "node:path";

export function getDataDir(): string {
  return join(homedir(), ".claude-village");
}

export function getEventsFilePath(): string {
  return join(getDataDir(), "events.ndjson");
}

export function getStateFilePath(): string {
  return join(getDataDir(), "state.json");
}

export function getConfigFilePath(): string {
  return join(getDataDir(), "config.json");
}
