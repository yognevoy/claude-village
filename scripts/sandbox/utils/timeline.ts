import type { ScenarioStep } from "../scenarios/ScenarioStep.js";

export interface TimelineEntry extends Omit<ScenarioStep, "delayMs"> {
  atMs: number;
}

export function toScenarioSteps(entries: readonly TimelineEntry[]): ScenarioStep[] {
  const sorted = [...entries].sort((a, b) => a.atMs - b.atMs);
  const steps: ScenarioStep[] = [];
  let previousAtMs = 0;

  for (const entry of sorted) {
    const { atMs, ...rest } = entry;
    steps.push({ ...rest, delayMs: atMs - previousAtMs });
    previousAtMs = atMs;
  }

  return steps;
}
