import { ClaudeEvent } from "../../../src/domain/events/ClaudeEvent.js";
import type { Scenario } from "./Scenario.js";
import type { ScenarioStep } from "./ScenarioStep.js";
import { randomDelay } from "../utils/randomDelay.js";

export class IdleScenario implements Scenario {
  public readonly name = "idle";
  public readonly loop = false;

  public buildSteps(): ScenarioStep[] {
    return [
      { event: ClaudeEvent.UserPromptSubmit, delayMs: randomDelay(1000, 2000) },
      { event: ClaudeEvent.PreToolUse, delayMs: randomDelay(500, 800), toolName: "Read" },
      { event: ClaudeEvent.PostToolUse, delayMs: randomDelay(700, 1200), toolName: "Read" },
      { event: ClaudeEvent.Stop, delayMs: randomDelay(1000, 1800) },
      { event: ClaudeEvent.Notification, delayMs: randomDelay(8000, 15000), notificationType: "idle_prompt" },
    ];
  }
}
