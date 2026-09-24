import express, { type Express, type Request, type Response, type NextFunction } from "express";
import type { Server } from "node:http";
import { DEFAULT_HOST } from "../shared/config.js";

export interface HttpServerOptions {
  port: number;
  host?: string;
  staticDir: string;
}

function isAllowedHost(hostHeader: string | undefined, port: number): boolean {
  if (!hostHeader) {
    return false;
  }
  return hostHeader === `127.0.0.1:${port}` || hostHeader === `localhost:${port}`;
}

export function createHttpServer(options: HttpServerOptions): Server {
  const host = options.host ?? DEFAULT_HOST;
  let boundPort = options.port;

  const app: Express = express();

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (!isAllowedHost(req.headers.host, boundPort)) {
      res.status(403).json({ error: "invalid_host" });
      return;
    }
    next();
  });

  app.get("/healthz", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  app.use(express.static(options.staticDir));

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: "not_found" });
  });

  const server = app.listen(options.port, host);
  server.on("listening", () => {
    const address = server.address();
    if (address !== null && typeof address !== "string") {
      boundPort = address.port;
    }
  });
  return server;
}
