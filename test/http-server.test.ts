import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { request, type Server } from "node:http";
import { createHttpServer } from "../src/server/http-server.js";

function requestWithHost(port: number, path: string, hostHeader: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const req = request(
      {
        host: "127.0.0.1",
        port,
        path,
        method: "GET",
        headers: { Host: hostHeader },
      },
      (res) => {
        res.resume();
        resolve(res.statusCode ?? 0);
      },
    );
    req.on("error", reject);
    req.end();
  });
}

async function startServer(): Promise<{ server: Server; port: number; staticDir: string }> {
  const staticDir = mkdtempSync(join(tmpdir(), "claude-village-test-"));
  const server = createHttpServer({ port: 0, staticDir });
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address();
  if (address === null || typeof address === "string") {
    throw new Error("expected server to bind to a numeric port");
  }
  return { server, port: address.port, staticDir };
}

function stopServer(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
}

test("GET /healthz returns 200 with a valid Host", async () => {
  const { server, port, staticDir } = await startServer();
  try {
    const res = await fetch(`http://127.0.0.1:${port}/healthz`, {
      headers: { Host: `127.0.0.1:${port}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.deepEqual(body, { status: "ok" });
  } finally {
    await stopServer(server);
    rmSync(staticDir, { recursive: true, force: true });
  }
});

test("GET /healthz returns 403 with a foreign Host (DNS rebinding protection)", async () => {
  const { server, port, staticDir } = await startServer();
  try {
    const status = await requestWithHost(port, "/healthz", "evil.example.com");
    assert.equal(status, 403);
  } finally {
    await stopServer(server);
    rmSync(staticDir, { recursive: true, force: true });
  }
});

test("unknown route returns 404", async () => {
  const { server, port, staticDir } = await startServer();
  try {
    const res = await fetch(`http://127.0.0.1:${port}/does-not-exist`, {
      headers: { Host: `127.0.0.1:${port}` },
    });
    assert.equal(res.status, 404);
  } finally {
    await stopServer(server);
    rmSync(staticDir, { recursive: true, force: true });
  }
});
