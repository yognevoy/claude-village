import { Command } from "commander";
import { createChannel } from "better-sse";
import { createHttpServer } from "../../server/http-server.js";
import { EventStreamPoller } from "../../server/EventStreamPoller.js";
import { WorkerIdlePoller } from "../../server/WorkerIdlePoller.js";
import { EventLineReader } from "../../repository/EventLineReader.js";
import { EventLineParser } from "../../../domain/events/EventLineParser.js";
import { WorkerRegistry } from "../../../domain/workers/WorkerRegistry.js";
import { WorkerIdleScheduler } from "../../../domain/workers/WorkerIdleScheduler.js";
import { SystemClock } from "../../../domain/workers/Clock.js";
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

      const registry = new WorkerRegistry(DEFAULT_CONFIG.spots);
      const channel = createChannel();
      const reader = new EventLineReader();
      const parser = new EventLineParser();
      const poller = new EventStreamPoller(reader, parser, registry, channel);
      poller.start();

      const idleScheduler = new WorkerIdleScheduler(
        registry,
        new SystemClock(),
        DEFAULT_CONFIG.idle,
        DEFAULT_CONFIG.subagents,
      );
      const idlePoller = new WorkerIdlePoller(idleScheduler, channel);
      idlePoller.start();

      const server = createHttpServer({
        port,
        host: DEFAULT_HOST,
        staticDir,
        sse: { channel, registry, keepAliveMs: SSE_KEEP_ALIVE_MS },
      });

      server.once("listening", () => {
        console.log(texts.cli.serverStarted(`http://${DEFAULT_HOST}:${port}`));
      });

      server.once("error", (error: NodeJS.ErrnoException) => {
        poller.stop();
        idlePoller.stop();
        if (error.code === "EADDRINUSE") {
          console.log(texts.cli.portInUse(port));
        } else {
          console.log(texts.cli.serverStartFailed(error.message));
        }
        process.exitCode = 1;
      });
    });
}
