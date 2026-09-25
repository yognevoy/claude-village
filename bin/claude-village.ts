#!/usr/bin/env node
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Command } from "commander";
import { createInstallCommand } from "../src/cli/commands/install.js";
import { createStartCommand } from "../src/cli/commands/start.js";
import { createUninstallCommand } from "../src/cli/commands/uninstall.js";
import { texts } from "../src/shared/texts.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const hookPath = join(__dirname, "..", "src", "hook", "hook.js");
const staticDir = join(__dirname, "..", "client");

const program = new Command();

program
  .name("claude-village")
  .description(texts.cli.description);

program.addCommand(createStartCommand(staticDir));
program.addCommand(createInstallCommand(hookPath));
program.addCommand(createUninstallCommand(hookPath));

program.parse(process.argv);
