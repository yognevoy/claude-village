import { Command } from "commander";
import { createHttpServer } from "../../infrastructure/server/http-server.js";
import { DEFAULT_CONFIG, DEFAULT_HOST } from "../../shared/config.js";
import { texts } from "../../shared/texts.js";

function resolvePort(raw: string | undefined): number {
  if (!raw) {
    return DEFAULT_CONFIG.port;
  }
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_CONFIG.port;
}

export function createStartCommand(staticDir: string): Command {
  return new Command("start")
    .description(texts.cli.startDescription)
    .option("--port <number>", texts.cli.portOptionDescription)
    .action((options: { port?: string }) => {
      const port = resolvePort(options.port);
      createHttpServer({ port, host: DEFAULT_HOST, staticDir });
      console.log(texts.cli.serverStarted(`http://${DEFAULT_HOST}:${port}`));
    });
}
