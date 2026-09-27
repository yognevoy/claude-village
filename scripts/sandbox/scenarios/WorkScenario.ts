import { ClaudeEvent } from "../../../src/domain/events/ClaudeEvent.js";
import type { Scenario } from "./Scenario.js";
import type { ScenarioStep } from "./ScenarioStep.js";
import { randomDelay } from "../utils/randomDelay.js";
import { pickCyclic } from "../utils/pickCyclic.js";

const TOOL_NAMES: readonly string[] = ["Read", "Edit", "Bash", "Grep"];

export class WorkScenario implements Scenario {
  public readonly name = "work";
  public readonly loop = true;

  private toolIndex = 0;

  public buildSteps(): ScenarioStep[] {
    const steps: ScenarioStep[] = [{ event: ClaudeEvent.UserPromptSubmit, delayMs: randomDelay(2000, 5000) }];

    const toolCallCount = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < toolCallCount; i++) {
      const toolName = pickCyclic(TOOL_NAMES, this.toolIndex++);
      steps.push({ event: ClaudeEvent.PreToolUse, delayMs: randomDelay(500, 900), toolName });
      steps.push({ event: ClaudeEvent.PostToolUse, delayMs: randomDelay(800, 1800), toolName });
    }

    steps.push({ event: ClaudeEvent.Stop, delayMs: randomDelay(1500, 3000) });

    return steps;
  }
}
