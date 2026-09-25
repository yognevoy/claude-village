import { Command } from "commander";
import { ClaudeSettingsRepository } from "../../repository/ClaudeSettingsRepository.js";
import { Installer } from "../../../domain/installer/Installer.js";
import { InvalidSettingsError } from "../../../domain/installer/InvalidSettingsError.js";
import { getClaudeSettingsPath } from "../../../shared/paths.js";
import { texts } from "../../../shared/texts.js";

export function createUninstallCommand(hookPath: string): Command {
  return new Command("uninstall")
    .description(texts.cli.uninstallDescription)
    .action(() => {
      const installer = new Installer(new ClaudeSettingsRepository(getClaudeSettingsPath()), hookPath);
      try {
        const changed = installer.uninstall();
        console.log(changed ? texts.cli.uninstallRemoved(getClaudeSettingsPath()) : texts.cli.uninstallNothingToRemove());
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
