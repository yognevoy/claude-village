import type { SpotType } from "../spots/SpotType.js";
import { WorkerPhase } from "./WorkerPhase.js";

export class Worker {
  public phase: WorkerPhase;
  public isWorking = false;
  public hasAlert = false;
  public hasQuestion = false;
  public lastEventAt: number;

  public constructor(
    public readonly sessionId: string,
    public projectName: string,
    public readonly spotType: SpotType,
    occupiesSlot: boolean,
    createdAt: number,
  ) {
    this.phase = occupiesSlot ? WorkerPhase.AtSpot : WorkerPhase.Queued;
    this.lastEventAt = createdAt;
  }
}
