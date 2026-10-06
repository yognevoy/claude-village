import { randomUUID } from "node:crypto";
import type { EventRepository } from "../../src/infrastructure/repository/EventRepository.js";
import { SandboxSession } from "./SandboxSession.js";
import { createScenario, SCENARIO_KINDS } from "./scenarios/scenarioFactory.js";
import { PROJECT_NAMES } from "./utils/projectNames.js";
import { pickRandom } from "./utils/pickRandom.js";
import { randomDelay } from "./utils/randomDelay.js";
import { waitFor } from "./utils/waitFor.js";

const SESSION_LIFETIME_MIN_MS = 7_000;
const SESSION_LIFETIME_MAX_MS = 30_000;
const SESSION_PAUSE_MIN_MS = 3_000;
const SESSION_PAUSE_MAX_MS = 10_000;

export class SandboxRunner {
  private readonly controllers: AbortController[] = [];
  private readonly liveSessions = new Set<SandboxSession>();

  constructor(
    private readonly sessionCount: number,
    private readonly repository: EventRepository,
  ) {}

  public start(): void {
    for (let slot = 0; slot < this.sessionCount; slot++) {
      const controller = new AbortController();

      this.controllers.push(controller);
      this.runSlot(controller.signal).catch((error: unknown) => {
        console.error(`[sandbox] slot ${slot} crashed`, error);
      });
    }
  }

  public stop(): void {
    for (const controller of this.controllers) {
      controller.abort();
    }

    for (const session of this.liveSessions) {
      session.end();
    }
  }

  private async runSlot(signal: AbortSignal): Promise<void> {
    while (!signal.aborted) {
      const kind = pickRandom(SCENARIO_KINDS);
      const projectName = pickRandom(PROJECT_NAMES);
      const sessionId = randomUUID();
      const cwd = `/home/sandbox-user/${projectName}`;
      const lifetimeMs = randomDelay(SESSION_LIFETIME_MIN_MS, SESSION_LIFETIME_MAX_MS);
      const scenario = createScenario(kind);
      const session = new SandboxSession(
        sessionId,
        cwd,
        scenario,
        lifetimeMs,
        this.repository,
      );
      const lifetimeSec = Math.round(lifetimeMs / 1000);

      const label = `${kind}, ${projectName}, ${lifetimeSec} s`;

      console.log(`[sandbox] session ${sessionId} (${label})`);

      this.liveSessions.add(session);
      await session.run(signal);
      this.liveSessions.delete(session);

      const pauseMs = randomDelay(SESSION_PAUSE_MIN_MS, SESSION_PAUSE_MAX_MS);

      await waitFor(pauseMs, signal);
    }
  }
}
