import { HookCommandEntry } from "./HookCommandEntry.js";

export class HookGroup {
  constructor(
    public readonly hooks: unknown[],
    private readonly extraFields: Record<string, unknown> = {},
  ) {}

  public static fromRaw(raw: unknown): HookGroup | null {
    if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
      return null;
    }
    const { hooks, ...extra } = raw as Record<string, unknown>;
    if (!Array.isArray(hooks)) {
      return null;
    }
    return new HookGroup(hooks, extra);
  }

  public hasOwnEntry(): boolean {
    return this.hooks.some(HookCommandEntry.isOwn);
  }

  public findOwnEntry(): unknown {
    return this.hooks.find(HookCommandEntry.isOwn);
  }

  public withoutOwnEntries(): HookGroup {
    return new HookGroup(
      this.hooks.filter((handler) => !HookCommandEntry.isOwn(handler)),
      this.extraFields,
    );
  }

  public isEmpty(): boolean {
    return this.hooks.length === 0;
  }

  public toJSON(): Record<string, unknown> {
    return { ...this.extraFields, hooks: this.hooks };
  }
}
