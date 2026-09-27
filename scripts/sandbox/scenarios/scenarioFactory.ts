import type { Scenario } from "./Scenario.js";
import { WorkScenario } from "./WorkScenario.js";
import { QuestionScenario } from "./QuestionScenario.js";
import { IdleScenario } from "./IdleScenario.js";
import { SubagentScenario } from "./SubagentScenario.js";

export type ScenarioKind = "work" | "question" | "idle" | "subagent";

export const SCENARIO_KINDS: readonly ScenarioKind[] = ["work", "question", "idle", "subagent"];

export function createScenario(kind: ScenarioKind): Scenario {
  switch (kind) {
    case "work":
      return new WorkScenario();
    case "question":
      return new QuestionScenario();
    case "idle":
      return new IdleScenario();
    case "subagent":
      return new SubagentScenario();
    default: {
      const exhaustiveCheck: never = kind;
      throw new Error(`Unknown scenario kind: ${String(exhaustiveCheck)}`);
    }
  }
}
