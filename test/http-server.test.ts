import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { request, type Server } from "node:http";
import { createHttpServer } from "../src/server/http-server.js";

const TEST_PORT = 58217;

function requestWithHost(path: string, hostHeader: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const req = request(
      {
        host: "127.0.0.1",
        port: TEST_PORT,
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

async function startServer(): Promise<{ server: Server; staticDir: string }> {
  const staticDir = mkdtempSync(join(tmpdir(), "claude-village-test-"));
  const server = createHttpServer({ port: TEST_PORT, staticDir });
  await new Promise<void>((resolve) => server.once("listening", resolve));
  return { server, staticDir };
}

function stopServer(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
}

test("GET /healthz returns 200 with a valid Host", async () => {
  const { server, staticDir } = await startServer();
  try {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/healthz`, {
      headers: { Host: `127.0.0.1:${TEST_PORT}` },
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
  const { server, staticDir } = await startServer();
  try {
    const status = await requestWithHost("/healthz", "evil.example.com");
    assert.equal(status, 403);
  } finally {
    await stopServer(server);
    rmSync(staticDir, { recursive: true, force: true });
  }
});

test("unknown route returns 404", async () => {
  const { server, staticDir } = await startServer();
  try {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/does-not-exist`, {
      headers: { Host: `127.0.0.1:${TEST_PORT}` },
    });
    assert.equal(res.status, 404);
  } finally {
    await stopServer(server);
    rmSync(staticDir, { recursive: true, force: true });
  }
});
