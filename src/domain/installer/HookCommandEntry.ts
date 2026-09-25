export interface HookCommandJson {
  type: "command";
  command: string;
  args: string[];
}

export class HookCommandEntry {
  public static readonly marker = "--claude-village-hook";

  constructor(private readonly hookPath: string) {}

  public toJSON(): HookCommandJson {
    return {
      type: "command",
      command: "node",
      args: [this.hookPath, HookCommandEntry.marker],
    };
  }

  public matchesHookPath(raw: unknown): boolean {
    if (!HookCommandEntry.isOwn(raw)) {
      return false;
    }
    const entry = raw as HookCommandJson;
    return entry.args[0] === this.hookPath;
  }

  public static isOwn(raw: unknown): boolean {
    if (typeof raw !== "object" || raw === null) {
      return false;
    }
    const entry = raw as Record<string, unknown>;
    return entry.type === "command" && Array.isArray(entry.args) && entry.args.includes(HookCommandEntry.marker);
  }
}
