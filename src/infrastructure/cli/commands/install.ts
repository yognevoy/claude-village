import { Command } from "commander";
import { ClaudeSettingsRepository } from "../../repository/ClaudeSettingsRepository.js";
import { Installer } from "../../../domain/installer/Installer.js";
import { InvalidSettingsError } from "../../../domain/installer/InvalidSettingsError.js";
import { getClaudeSettingsPath } from "../../../shared/paths.js";
import { texts } from "../../../shared/texts.js";

export function createInstallCommand(hookPath: string): Command {
  return new Command("install")
    .description(texts.cli.installDescription)
    .action(() => {
      const settingsPath = getClaudeSettingsPath();
      const repository = new ClaudeSettingsRepository(settingsPath);
      const installer = new Installer(repository, hookPath);
      try {
        const changed = installer.install();
        if (changed) {
          console.log(texts.cli.installApplied(settingsPath));
        } else {
          console.log(texts.cli.installNoChanges());
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
