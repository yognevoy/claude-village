import { randomUUID } from "node:crypto";
import type { EventRepository } from "../../src/infrastructure/repository/EventRepository.js";
import { SandboxSession } from "./SandboxSession.js";
import { createScenario, SCENARIO_KINDS } from "./scenarios/scenarioFactory.js";
import { PROJECT_NAMES } from "./utils/projectNames.js";
import { pickCyclic } from "./utils/pickCyclic.js";

export class SandboxRunner {
  private readonly controllers: AbortController[] = [];

  constructor(
    private readonly sessionCount: number,
    private readonly repository: EventRepository,
  ) {}

  public start(): void {
    for (let i = 0; i < this.sessionCount; i++) {
      const kind = pickCyclic(SCENARIO_KINDS, i);
      const projectName = pickCyclic(PROJECT_NAMES, i);
      const cwd = `/home/sandbox-user/${projectName}`;
      const sessionId = randomUUID();
      const scenario = createScenario(kind);
      const session = new SandboxSession(sessionId, cwd, scenario, this.repository);
      const controller = new AbortController();

      this.controllers.push(controller);
      session.run(controller.signal).catch((error: unknown) => {
        console.error(`[sandbox] session ${sessionId} crashed`, error);
      });

      console.log(`[sandbox] session ${sessionId} (${kind}) — ${projectName}`);
    }
  }

  public stop(): void {
    for (const controller of this.controllers) {
      controller.abort();
    }
  }
}
