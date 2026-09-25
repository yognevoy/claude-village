#!/usr/bin/env node
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Command } from "commander";
import { createHttpServer } from "../src/infrastructure/server/http-server.js";
import { ClaudeSettingsRepository } from "../src/installer/ClaudeSettingsRepository.js";
import { Installer } from "../src/installer/Installer.js";
import { InvalidSettingsError } from "../src/installer/InvalidSettingsError.js";
import { DEFAULT_CONFIG, DEFAULT_HOST } from "../src/shared/config.js";
import { getClaudeSettingsPath } from "../src/shared/paths.js";
import { texts } from "../src/shared/texts.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const hookPath = join(__dirname, "..", "src", "hook", "hook.js");

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

function createInstaller(): Installer {
  const repository = new ClaudeSettingsRepository(getClaudeSettingsPath());
  return new Installer(repository, hookPath);
}

function runInstall(options: { dryRun?: boolean }): void {
  const installer = createInstaller();
  try {
    if (options.dryRun) {
      for (const item of installer.plan()) {
        console.log(texts.cli.installPlanLine(item.event, item.action));
      }
      return;
    }
    const plan = installer.install();
    if (plan.every((item) => item.action === "keep")) {
      console.log(texts.cli.installNoChanges());
    } else {
      console.log(texts.cli.installApplied(getClaudeSettingsPath()));
    }
  } catch (error) {
    if (error instanceof InvalidSettingsError) {
      console.log(texts.cli.invalidSettingsJson(error.settingsPath));
      process.exitCode = 1;
      return;
    }
    throw error;
  }
}

function runUninstall(): void {
  const installer = createInstaller();
  try {
    const affected = installer.uninstall();
    if (affected.length === 0) {
      console.log(texts.cli.uninstallNothingToRemove());
    } else {
      console.log(texts.cli.uninstallRemoved(getClaudeSettingsPath()));
    }
  } catch (error) {
    if (error instanceof InvalidSettingsError) {
      console.log(texts.cli.invalidSettingsJson(error.settingsPath));
      process.exitCode = 1;
      return;
    }
    throw error;
  }
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
  .option("--dry-run", texts.cli.installDryRunOptionDescription)
  .action(runInstall);

program
  .command("uninstall")
  .description(texts.cli.uninstallDescription)
  .action(runUninstall);

program.parse(process.argv);
