import express, { type Express, type Request, type Response } from "express";
import type { Server } from "node:http";
import { DEFAULT_HOST } from "../shared/config.js";
import { createHostGuard } from "./middleware/host-guard.js";

export interface HttpServerOptions {
  port: number;
  host?: string;
  staticDir: string;
}

export function createHttpServer(options: HttpServerOptions): Server {
  const host = options.host ?? DEFAULT_HOST;

  const app: Express = express();

  app.use(createHostGuard(options.port));

  app.get("/healthz", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  app.use(express.static(options.staticDir));

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: "not_found" });
  });

  return app.listen(options.port, host);
}
