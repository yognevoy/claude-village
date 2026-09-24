export const texts = {
  cli: {
    description: "Show Claude Code sessions as a pixel-art village in the browser",
    startDescription: "Start the local server",
    portOptionDescription: "Port to listen on",
    installDescription: "Register Claude Code hooks in ~/.claude/settings.json",
    uninstallDescription: "Remove the hooks this tool registered",
    serverStarted: (address: string): string => `Server started: ${address}`,
    notImplemented: (command: string): string => `Command "${command}" is not implemented yet`,
  },
};
