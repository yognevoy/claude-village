import { ClaudeEvent } from "../events/ClaudeEvent.js";
import { ClaudeSettingsRepository, type SettingsJson } from "../../infrastructure/repository/ClaudeSettingsRepository.js";
import { HookCommandEntry } from "./HookCommandEntry.js";

export type InstallAction = "add" | "update" | "keep";

export interface InstallPlanEntry {
  event: ClaudeEvent;
  action: InstallAction;
}

interface HookGroup {
  hooks: unknown[];
  [key: string]: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isHookGroup(value: unknown): value is HookGroup {
  return isRecord(value) && Array.isArray(value.hooks);
}

export class Installer {
  constructor(
    private readonly settings: ClaudeSettingsRepository,
    private readonly hookPath: string,
  ) {}

  public plan(): InstallPlanEntry[] {
    const settings = this.settings.read();
    const hooksSection = this.readHooksSection(settings);
    const entry = new HookCommandEntry(this.hookPath);

    return Object.values(ClaudeEvent).map((event) => {
      const groups = this.readEventGroups(hooksSection, event);
      const existing = this.findOwnCommand(groups);
      if (existing === undefined) {
        return { event, action: "add" };
      }
      return { event, action: entry.matchesHookPath(existing) ? "keep" : "update" };
    });
  }

  public install(): InstallPlanEntry[] {
    const plan = this.plan();
    if (plan.every((item) => item.action === "keep")) {
      return plan;
    }

    const settings = this.settings.read();
    const hooksSection = this.ensureHooksSection(settings);
    const entry = new HookCommandEntry(this.hookPath);

    for (const event of Object.values(ClaudeEvent)) {
      const groups = this.readEventGroups(hooksSection, event).map((group) => this.withoutOwnEntries(group));
      const remaining = groups.filter((group) => group.hooks.length > 0);
      remaining.push({ hooks: [entry.toJSON()] });
      hooksSection[event] = remaining;
    }

    this.settings.write(settings);
    return plan;
  }

  public uninstall(): ClaudeEvent[] {
    const settings = this.settings.read();
    const hooksSection = this.readHooksSection(settings);
    const affected: ClaudeEvent[] = [];

    for (const event of Object.values(ClaudeEvent)) {
      const groups = this.readEventGroups(hooksSection, event);
      const hasOwnEntry = groups.some((group) => group.hooks.some((handler) => HookCommandEntry.isOwn(handler)));
      if (!hasOwnEntry) {
        continue;
      }

      affected.push(event);
      const cleaned = groups.map((group) => this.withoutOwnEntries(group)).filter((group) => group.hooks.length > 0);
      if (cleaned.length > 0) {
        hooksSection[event] = cleaned;
      } else {
        delete hooksSection[event];
      }
    }

    if (affected.length === 0) {
      return affected;
    }

    if (Object.keys(hooksSection).length === 0) {
      delete settings.hooks;
    }

    this.settings.write(settings);
    return affected;
  }

  private withoutOwnEntries(group: HookGroup): HookGroup {
    return {
      ...group,
      hooks: group.hooks.filter((handler) => !HookCommandEntry.isOwn(handler)),
    };
  }

  private findOwnCommand(groups: HookGroup[]): unknown {
    for (const group of groups) {
      const found = group.hooks.find((handler) => HookCommandEntry.isOwn(handler));
      if (found !== undefined) {
        return found;
      }
    }
    return undefined;
  }

  private readHooksSection(settings: SettingsJson): Record<string, unknown> {
    return isRecord(settings.hooks) ? settings.hooks : {};
  }

  private ensureHooksSection(settings: SettingsJson): Record<string, unknown> {
    if (!isRecord(settings.hooks)) {
      settings.hooks = {};
    }
    return settings.hooks as Record<string, unknown>;
  }

  private readEventGroups(hooksSection: Record<string, unknown>, event: ClaudeEvent): HookGroup[] {
    const raw = hooksSection[event];
    if (!Array.isArray(raw)) {
      return [];
    }
    return raw.filter(isHookGroup);
  }
}
