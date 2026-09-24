#!/usr/bin/env node
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parseArgs } from "node:util";
import { createHttpServer } from "../src/server/http-server.js";
import { DEFAULT_CONFIG, DEFAULT_HOST } from "../src/shared/config.js";
import { texts } from "../src/shared/texts.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { positionals, values } = parseArgs({
  args: process.argv.slice(2),
  allowPositionals: true,
  options: {
    port: { type: "string" },
  },
});

function resolvePort(): number {
  if (!values.port) {
    return DEFAULT_CONFIG.port;
  }
  const parsed = Number.parseInt(values.port, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_CONFIG.port;
}

function runStart(): void {
  const port = resolvePort();
  const staticDir = join(__dirname, "..", "client");
  createHttpServer({ port, host: DEFAULT_HOST, staticDir });
  console.log(texts.cli.serverStarted(`http://${DEFAULT_HOST}:${port}`));
}

function runInstall(): void {
  console.log(texts.cli.notImplemented("install"));
}

function runUninstall(): void {
  console.log(texts.cli.notImplemented("uninstall"));
}

function printUsage(): void {
  console.log(texts.cli.usage);
}

const command = positionals[0];

switch (command) {
  case "start":
    runStart();
    break;
  case "install":
    runInstall();
    break;
  case "uninstall":
    runUninstall();
    break;
  default:
    printUsage();
    break;
}
