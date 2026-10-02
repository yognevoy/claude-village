import type { SpotType } from "../spots/SpotType.js";
import type { Worker } from "./Worker.js";
import type { WorkerPhase } from "./WorkerPhase.js";

export class WorkerState {
  private constructor(
    public readonly sessionId: string,
    public readonly projectName: string,
    public readonly spotType: SpotType,
    public readonly phase: WorkerPhase,
    public readonly isWorking: boolean,
    public readonly hasAlert: boolean,
    public readonly hasQuestion: boolean,
    public readonly subagentCount: number,
    public readonly lastEventAt: number,
    public readonly removed: boolean,
  ) {}

  public static from(worker: Worker): WorkerState {
    return new WorkerState(
      worker.sessionId,
      worker.projectName,
      worker.spotType,
      worker.phase,
      worker.isWorking,
      worker.hasAlert,
      worker.hasQuestion,
      worker.subagentCount(),
      worker.lastEventAt,
      false,
    );
  }

  public asRemoved(): WorkerState {
    return new WorkerState(
      this.sessionId,
      this.projectName,
      this.spotType,
      this.phase,
      this.isWorking,
      this.hasAlert,
      this.hasQuestion,
      this.subagentCount,
      this.lastEventAt,
      true,
    );
  }
}
