#!/usr/bin/env node
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Command } from "commander";
import { createHttpServer } from "../src/infrastructure/server/http-server.js";
import { DEFAULT_CONFIG, DEFAULT_HOST } from "../src/shared/config.js";
import { texts } from "../src/shared/texts.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function resolvePort(raw: string | undefined): number {
  if (!raw) {
    return DEFAULT_CONFIG.port;
  }
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_CONFIG.port;
}

function runStart(options: { port?: string }): void {
  const port = resolvePort(options.port);
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

const program = new Command();

program
  .name("claude-village")
  .description(texts.cli.description);

program
  .command("start")
  .description(texts.cli.startDescription)
  .option("--port <number>", texts.cli.portOptionDescription)
  .action(runStart);

program
  .command("install")
  .description(texts.cli.installDescription)
  .action(runInstall);

program
  .command("uninstall")
  .description(texts.cli.uninstallDescription)
  .action(runUninstall);

program.parse(process.argv);
