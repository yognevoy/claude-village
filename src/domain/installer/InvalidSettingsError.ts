export class InvalidSettingsError extends Error {
  constructor(public readonly settingsPath: string) {
    super(`Invalid JSON in ${settingsPath}`);
    this.name = "InvalidSettingsError";
  }
}
