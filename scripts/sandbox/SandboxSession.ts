import { ClaudeEvent } from "../../src/domain/events/ClaudeEvent.js";
import type { EventLineRecord } from "../../src/domain/events/EventLineRecord.js";
import type { EventRepository } from "../../src/infrastructure/repository/EventRepository.js";
import type { Scenario } from "./scenarios/Scenario.js";
import type { ScenarioStep } from "./scenarios/ScenarioStep.js";

export class SandboxSession {
  constructor(
    private readonly sessionId: string,
    private readonly cwd: string,
    private readonly scenario: Scenario,
    private readonly repository: EventRepository,
  ) {}

  public async run(signal: AbortSignal): Promise<void> {
    this.emit({ event: ClaudeEvent.SessionStart, delayMs: 0 });

    do {
      const steps = this.scenario.buildSteps();
      for (const step of steps) {
        await this.wait(step.delayMs, signal);
        if (signal.aborted) {
          return;
        }
        this.emit(step);
      }
    } while (this.scenario.loop && !signal.aborted);
  }

  private emit(step: ScenarioStep): void {
    const record: EventLineRecord = {
      ts: Date.now(),
      event: step.event,
      sessionId: this.sessionId,
      cwd: this.cwd,
      toolName: step.toolName ?? null,
      agentId: step.agentId ?? null,
      ...(step.event === ClaudeEvent.Notification && { notificationType: step.notificationType ?? null }),
    };
    this.repository.save(record);
  }

  private wait(ms: number, signal: AbortSignal): Promise<void> {
    if (ms <= 0) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const timer = setTimeout(resolve, ms);
      signal.addEventListener(
        "abort",
        () => {
          clearTimeout(timer);
          resolve();
        },
        { once: true },
      );
    });
  }
}
