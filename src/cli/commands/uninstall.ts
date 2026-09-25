import { Command } from "commander";
import { ClaudeSettingsRepository } from "../../installer/ClaudeSettingsRepository.js";
import { Installer } from "../../installer/Installer.js";
import { InvalidSettingsError } from "../../installer/InvalidSettingsError.js";
import { getClaudeSettingsPath } from "../../shared/paths.js";
import { texts } from "../../shared/texts.js";

export function createUninstallCommand(hookPath: string): Command {
  return new Command("uninstall")
    .description(texts.cli.uninstallDescription)
    .action(() => {
      const installer = new Installer(new ClaudeSettingsRepository(getClaudeSettingsPath()), hookPath);
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
    });
}
