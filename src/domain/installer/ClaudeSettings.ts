import { ClaudeEvent } from "../events/ClaudeEvent.js";
import { HookCommandEntry } from "./HookCommandEntry.js";
import { HookGroup } from "./HookGroup.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export class ClaudeSettings {
  private readonly hooks: Record<string, unknown>;

  constructor(private readonly raw: Record<string, unknown>) {
    if (!isRecord(raw.hooks)) {
      raw.hooks = {};
    }
    this.hooks = raw.hooks as Record<string, unknown>;
  }

  public getGroups(event: ClaudeEvent): HookGroup[] {
    const rawGroups = this.hooks[event];
    if (!Array.isArray(rawGroups)) {
      return [];
    }
    return rawGroups
      .map((item) => HookGroup.fromRaw(item))
      .filter((group): group is HookGroup => group !== null);
  }

  public setGroups(event: ClaudeEvent, groups: HookGroup[]): void {
    if (groups.length > 0) {
      this.hooks[event] = groups;
    } else {
      delete this.hooks[event];
      if (Object.keys(this.hooks).length === 0) {
        delete this.raw.hooks;
      }
    }
  }

  public findOwnEntry(event: ClaudeEvent): unknown {
    for (const group of this.getGroups(event)) {
      const found = group.findOwnEntry();
      if (found !== undefined) {
        return found;
      }
    }
    return undefined;
  }

  public isInstalled(entry: HookCommandEntry): boolean {
    return Object.values(ClaudeEvent).every((event) => {
      const existing = this.findOwnEntry(event);
      return existing !== undefined && entry.matchesHookPath(existing);
    });
  }

  public toJSON(): Record<string, unknown> {
    return this.raw;
  }
}
