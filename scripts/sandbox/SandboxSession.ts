import { ClaudeEvent } from "../../src/domain/events/ClaudeEvent.js";
import type { EventLineRecord } from "../../src/domain/events/EventLineRecord.js";
import type { EventRepository } from "../../src/infrastructure/repository/EventRepository.js";
import type { Scenario } from "./scenarios/Scenario.js";
import type { ScenarioStep } from "./scenarios/ScenarioStep.js";
import { waitFor } from "./utils/waitFor.js";

export class SandboxSession {
  private ended = false;

  constructor(
    private readonly sessionId: string,
    private readonly cwd: string,
    private readonly scenario: Scenario,
    private readonly lifetimeMs: number,
    private readonly repository: EventRepository,
  ) {}

  public async run(signal: AbortSignal): Promise<void> {
    const deadline = Date.now() + this.lifetimeMs;

    this.emit({ event: ClaudeEvent.SessionStart, delayMs: 0 });

    do {
      const steps = this.scenario.buildSteps();
      for (const step of steps) {
        await waitFor(step.delayMs, signal);
        if (signal.aborted) {
          return;
        }
        this.emit(step);
      }
    } while (this.scenario.loop && Date.now() < deadline && !signal.aborted);

    await waitFor(deadline - Date.now(), signal);
    if (signal.aborted) {
      return;
    }

    this.end();
  }

  public end(): void {
    if (this.ended) {
      return;
    }

    this.ended = true;
    this.emit({ event: ClaudeEvent.SessionEnd, delayMs: 0 });
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
}
