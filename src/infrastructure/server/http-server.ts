import express, { type Express, type Request, type Response } from "express";
import type { Server } from "node:http";
import { createSession, type Channel } from "better-sse";
import { DEFAULT_HOST } from "../../shared/config.js";
import { createHostGuard } from "./middleware/host-guard.js";
import type { LatestEventStore } from "../../domain/events/LatestEventStore.js";

export interface HttpServerOptions {
  port: number;
  host?: string;
  staticDir: string;
  sse: { channel: Channel; store: LatestEventStore; keepAliveMs: number };
}

export function createHttpServer(options: HttpServerOptions): Server {
  const host = options.host ?? DEFAULT_HOST;

  const app: Express = express();

  app.use(createHostGuard(options.port));

  app.get("/healthz", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  app.get("/events", async (req: Request, res: Response) => {
    const { channel, store, keepAliveMs } = options.sse;
    const session = await createSession(req, res, { keepAlive: keepAliveMs });
    channel.register(session);
    session.push(store.snapshot(), "snapshot");
  });

  app.use(express.static(options.staticDir));

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: "not_found" });
  });

  return app.listen(options.port, host);
}
