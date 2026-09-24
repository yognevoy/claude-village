import type { RequestHandler } from "express";

export function createHostGuard(port: number): RequestHandler {
  const allowedHosts = new Set([`127.0.0.1:${port}`, `localhost:${port}`]);

  return (req, res, next) => {
    if (!req.headers.host || !allowedHosts.has(req.headers.host)) {
      res.status(403).json({ error: "invalid_host" });
      return;
    }
    next();
  };
}
