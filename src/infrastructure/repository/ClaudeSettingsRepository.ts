import { copyFileSync, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { InvalidSettingsError } from "../../domain/installer/InvalidSettingsError.js";

export type SettingsJson = Record<string, unknown>;

export class ClaudeSettingsRepository {
  constructor(private readonly settingsPath: string) {}

  public read(): SettingsJson {
    if (!existsSync(this.settingsPath)) {
      return {};
    }
    const raw = readFileSync(this.settingsPath, "utf-8");
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new InvalidSettingsError(this.settingsPath);
    }
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      throw new InvalidSettingsError(this.settingsPath);
    }
    return parsed as SettingsJson;
  }

  public write(settings: SettingsJson): void {
    mkdirSync(dirname(this.settingsPath), { recursive: true });
    if (existsSync(this.settingsPath)) {
      this.backup();
    }
    const tmpPath = `${this.settingsPath}.tmp-${process.pid}-${Date.now()}`;
    writeFileSync(tmpPath, `${JSON.stringify(settings, null, 2)}\n`, "utf-8");
    renameSync(tmpPath, this.settingsPath);
  }

  private backup(): void {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    copyFileSync(this.settingsPath, `${this.settingsPath}.backup-${timestamp}`);
  }
}
