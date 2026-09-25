import { Command } from "commander";
import { createChannel } from "better-sse";
import { createHttpServer } from "../../server/http-server.js";
import { EventStreamPoller } from "../../server/EventStreamPoller.js";
import { EventLineReader } from "../../repository/EventLineReader.js";
import { EventLineParser } from "../../../domain/events/EventLineParser.js";
import { LatestEventStore } from "../../../domain/events/LatestEventStore.js";
import { DEFAULT_CONFIG, DEFAULT_HOST } from "../../../shared/config.js";
import { texts } from "../../../shared/texts.js";

const SSE_KEEP_ALIVE_MS = 10000;

function resolvePort(raw: string | undefined): number {
  if (!raw) {
    return DEFAULT_CONFIG.port;
  }
  const parsed = Number.parseInt(raw, 10);
  const isValid = Number.isFinite(parsed) && parsed > 0;
  return isValid ? parsed : DEFAULT_CONFIG.port;
}

export function createStartCommand(staticDir: string): Command {
  return new Command("start")
    .description(texts.cli.startDescription)
    .option("--port <number>", texts.cli.portOptionDescription)
    .action((options: { port?: string }) => {
      const port = resolvePort(options.port);

      const store = new LatestEventStore();
      const channel = createChannel();
      const reader = new EventLineReader();
      const parser = new EventLineParser();
      const poller = new EventStreamPoller(reader, parser, store, channel);
      poller.start();

      createHttpServer({
        port,
        host: DEFAULT_HOST,
        staticDir,
        sse: { channel, store, keepAliveMs: SSE_KEEP_ALIVE_MS },
      });

      console.log(texts.cli.serverStarted(`http://${DEFAULT_HOST}:${port}`));
    });
}
