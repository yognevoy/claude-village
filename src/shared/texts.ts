export const texts = {
  cli: {
    description: "Show Claude Code sessions as a pixel-art village in the browser",
    startDescription: "Start the local server",
    portOptionDescription: "Port to listen on",
    installDescription: "Register Claude Code hooks in ~/.claude/settings.json",
    uninstallDescription: "Remove the hooks this tool registered",
    serverStarted: (address: string): string => `Server started: ${address}`,
    installApplied: (settingsPath: string): string => `Hooks installed in ${settingsPath}`,
    installNoChanges: (): string => "Hooks already up to date",
    uninstallRemoved: (settingsPath: string): string => `Hooks removed from ${settingsPath}`,
    uninstallNothingToRemove: (): string => "No claude-village hooks found",
    invalidSettingsJson: (settingsPath: string): string => `${settingsPath} contains invalid JSON, nothing changed`,
  },
};
