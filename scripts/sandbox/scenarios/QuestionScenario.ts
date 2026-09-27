import { ClaudeEvent } from "../../../src/domain/events/ClaudeEvent.js";
import type { Scenario } from "./Scenario.js";
import type { ScenarioStep } from "./ScenarioStep.js";
import { randomDelay } from "../utils/randomDelay.js";

export class QuestionScenario implements Scenario {
  public readonly name = "question";
  public readonly loop = true;

  public buildSteps(): ScenarioStep[] {
    return [
      { event: ClaudeEvent.UserPromptSubmit, delayMs: randomDelay(5000, 10000) },
      { event: ClaudeEvent.PreToolUse, delayMs: randomDelay(500, 900), toolName: "Bash" },
      { event: ClaudeEvent.PermissionRequest, delayMs: randomDelay(300, 600), toolName: "Bash" },
      { event: ClaudeEvent.PostToolUse, delayMs: randomDelay(4000, 9000), toolName: "Bash" },
      { event: ClaudeEvent.Stop, delayMs: randomDelay(1000, 2000) },
    ];
  }
}
