import { Command } from "commander";
import { ClaudeSettingsRepository } from "../../infrastructure/repository/ClaudeSettingsRepository.js";
import { Installer } from "../../installer/Installer.js";
import { InvalidSettingsError } from "../../installer/InvalidSettingsError.js";
import { getClaudeSettingsPath } from "../../shared/paths.js";
import { texts } from "../../shared/texts.js";

export function createInstallCommand(hookPath: string): Command {
  return new Command("install")
    .description(texts.cli.installDescription)
    .action(() => {
      const installer = new Installer(new ClaudeSettingsRepository(getClaudeSettingsPath()), hookPath);
      try {
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
    });
}
