const STORAGE_KEY = "claude-village:settings";

export interface ClientSettings {
  readonly soundOn: boolean;
  readonly alertsOn: boolean;
  readonly themeId: string;
  readonly sidebarCollapsed: boolean;
}

const DEFAULT_SETTINGS: ClientSettings = {
  soundOn: false,
  alertsOn: false,
  themeId: "wood",
  sidebarCollapsed: false,
};

export class ClientSettingsStore {
  private settings: ClientSettings;

  public constructor() {
    this.settings = this.load();
  }

  public get(): ClientSettings {
    return this.settings;
  }

  public update(patch: Partial<ClientSettings>): void {
    this.settings = { ...this.settings, ...patch };
    this.save();
  }

  private load(): ClientSettings {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);

      if (raw === null) {
        return DEFAULT_SETTINGS;
      }

      const parsed = JSON.parse(raw) as Partial<Record<keyof ClientSettings, unknown>>;

      return {
        soundOn: this.readBoolean(parsed.soundOn, DEFAULT_SETTINGS.soundOn),
        alertsOn: this.readBoolean(parsed.alertsOn, DEFAULT_SETTINGS.alertsOn),
        themeId: this.readString(parsed.themeId, DEFAULT_SETTINGS.themeId),
        sidebarCollapsed: this.readBoolean(
          parsed.sidebarCollapsed,
          DEFAULT_SETTINGS.sidebarCollapsed,
        ),
      };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  private readBoolean(value: unknown, fallback: boolean): boolean {
    return typeof value === "boolean" ? value : fallback;
  }

  private readString(value: unknown, fallback: string): string {
    return typeof value === "string" ? value : fallback;
  }

  private save(): void {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    } catch {
      return;
    }
  }
}
