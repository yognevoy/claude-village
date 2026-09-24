export const texts = {
  cli: {
    usage: "Usage: claude-village <install|uninstall|start> [--port <number>]",
    serverStarted: (address: string): string => `Server started: ${address}`,
    notImplemented: (command: string): string => `Command "${command}" is not implemented yet`,
  },
};
