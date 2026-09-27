import { ClaudeEvent } from "../../../src/domain/events/ClaudeEvent.js";
import type { Scenario } from "./Scenario.js";
import type { ScenarioStep } from "./ScenarioStep.js";
import { randomDelay } from "../utils/randomDelay.js";
import { pickCyclic } from "../utils/pickCyclic.js";
import { toScenarioSteps } from "../utils/timeline.js";
import type { TimelineEntry } from "../utils/timeline.js";

const SUBAGENT_COUNT = 8;
const SUBAGENT_TOOL_NAMES: readonly string[] = ["Read", "Grep", "Bash", "Write"];

export class SubagentScenario implements Scenario {
  public readonly name = "subagent";
  public readonly loop = true;

  private cycleIndex = 0;

  public buildSteps(): ScenarioStep[] {
    const cycle = this.cycleIndex++;
    const entries: TimelineEntry[] = [];

    const promptAt = randomDelay(2000, 4000);
    entries.push({ atMs: promptAt, event: ClaudeEvent.UserPromptSubmit });

    const dispatchAt = promptAt + 300;
    entries.push({ atMs: dispatchAt, event: ClaudeEvent.PreToolUse, toolName: "Agent" });

    let lastStopAt = dispatchAt;
    for (let i = 0; i < SUBAGENT_COUNT; i++) {
      const agentId = `sim-${cycle}-sub-${i}`;
      const startAt = dispatchAt + 200 + i * 250;
      entries.push({ atMs: startAt, event: ClaudeEvent.SubagentStart, agentId });

      const toolName = pickCyclic(SUBAGENT_TOOL_NAMES, i);
      const workAt = startAt + 200;
      entries.push({ atMs: workAt, event: ClaudeEvent.PreToolUse, agentId, toolName });

      const doneAt = workAt + randomDelay(600, 1200);
      entries.push({ atMs: doneAt, event: ClaudeEvent.PostToolUse, agentId, toolName });

      const stopAt = doneAt + randomDelay(300, 900);
      entries.push({ atMs: stopAt, event: ClaudeEvent.SubagentStop, agentId });

      lastStopAt = Math.max(lastStopAt, stopAt);
    }

    entries.push({ atMs: lastStopAt + 400, event: ClaudeEvent.PostToolUse, toolName: "Agent" });
    entries.push({ atMs: lastStopAt + 2000, event: ClaudeEvent.Stop });

    return toScenarioSteps(entries);
  }
}
