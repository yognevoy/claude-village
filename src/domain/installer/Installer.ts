import { ClaudeEvent } from "../events/ClaudeEvent.js";
import { ClaudeSettingsRepository } from "../../infrastructure/repository/ClaudeSettingsRepository.js";
import { ClaudeSettings } from "./ClaudeSettings.js";
import { HookCommandEntry } from "./HookCommandEntry.js";
import { HookGroup } from "./HookGroup.js";

export class Installer {
  constructor(
    private readonly repository: ClaudeSettingsRepository,
    private readonly hookPath: string,
  ) {}

  public install(): boolean {
    const settings = new ClaudeSettings(this.repository.read());
    const entry = new HookCommandEntry(this.hookPath);

    if (settings.isInstalled(entry)) {
      return false;
    }

    for (const event of Object.values(ClaudeEvent)) {
      const groups = settings
        .getGroups(event)
        .map((group) => group.withoutOwnEntries())
        .filter((group) => !group.isEmpty());
      groups.push(new HookGroup([entry.toJSON()]));
      settings.setGroups(event, groups);
    }

    this.repository.write(settings.toJSON());
    return true;
  }

  public uninstall(): boolean {
    const settings = new ClaudeSettings(this.repository.read());
    let changed = false;

    for (const event of Object.values(ClaudeEvent)) {
      const groups = settings.getGroups(event);
      if (!groups.some((group) => group.hasOwnEntry())) {
        continue;
      }

      changed = true;
      const remaining = groups
        .map((group) => group.withoutOwnEntries())
        .filter((group) => !group.isEmpty());
      settings.setGroups(event, remaining);
    }

    if (!changed) {
      return false;
    }

    this.repository.write(settings.toJSON());
    return true;
  }
}
