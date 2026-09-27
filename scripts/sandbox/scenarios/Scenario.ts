import type { ScenarioStep } from "./ScenarioStep.js";

export interface Scenario {
  readonly name: string;
  readonly loop: boolean;
  buildSteps(): ScenarioStep[];
}
