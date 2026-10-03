import express, { type Express, type Request, type Response } from "express";
import type { Server } from "node:http";
import { createSession, type Channel } from "better-sse";
import { DEFAULT_HOST } from "../../shared/config.js";
import { SseEvent } from "../../domain/workers/SseEvent.js";
import { createHostGuard } from "./middleware/host-guard.js";
import type { WorkerRegistry } from "../../domain/workers/WorkerRegistry.js";
import { WorkerState } from "../../domain/workers/WorkerState.js";
import { ResourceTotals } from "../../domain/resources/ResourceTotals.js";

export interface HttpServerOptions {
  port: number;
  host?: string;
  staticDir: string;
  sse: { channel: Channel; registry: WorkerRegistry; keepAliveMs: number };
}

export function createHttpServer(options: HttpServerOptions): Server {
  const host = options.host ?? DEFAULT_HOST;

  const app: Express = express();

  app.use(createHostGuard(options.port));

  app.get("/healthz", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  app.get("/events", async (req: Request, res: Response) => {
    const { channel, registry, keepAliveMs } = options.sse;
    const session = await createSession(req, res, { keepAlive: keepAliveMs });
    channel.register(session);
    session.push(registry.list().map((worker) => WorkerState.from(worker)), SseEvent.Snapshot);

    const totals = ResourceTotals.from(registry.resourceCounters);
    session.push(totals, SseEvent.Resources);
  });

  app.use(express.static(options.staticDir));

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: "not_found" });
  });

  return app.listen(options.port, host);
}
