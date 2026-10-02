import { SpotType } from "../../domain/spots/SpotType.js";
import { WorkerPhase } from "../../domain/workers/WorkerPhase.js";
import type { WorkerState } from "../../domain/workers/WorkerState.js";
import { CAMPFIRE_SEATS, SPOT_SLOTS, TAVERN_TERRACE_SEATS, TOWN_HALL_SPAWN, type Point } from "./WorldMap.js";

interface Assignment {
  readonly poolKey: string;
  readonly index: number;
}

const POOLS = new Map<string, readonly Point[]>([
  [WorkerPhase.AtCampfire, CAMPFIRE_SEATS],
  [WorkerPhase.AtTavern, TAVERN_TERRACE_SEATS],
  [`${WorkerPhase.AtSpot}:${SpotType.Mine}`, SPOT_SLOTS[SpotType.Mine]],
  [`${WorkerPhase.AtSpot}:${SpotType.Forest}`, SPOT_SLOTS[SpotType.Forest]],
  [`${WorkerPhase.AtSpot}:${SpotType.River}`, SPOT_SLOTS[SpotType.River]],
]);

export class WorkerPlacement {
  private readonly occupantsByPool = new Map<string, (string | undefined)[]>();
  private readonly assignmentBySession = new Map<string, Assignment>();

  public place(worker: WorkerState): Point {
    const poolKey = this.keyFor(worker);

    if (poolKey === null) {
      return TOWN_HALL_SPAWN;
    }

    const anchors = POOLS.get(poolKey);

    if (anchors === undefined) {
      return TOWN_HALL_SPAWN;
    }

    const index = this.assign(worker.sessionId, poolKey, anchors.length);
    return anchors[index] ?? TOWN_HALL_SPAWN;
  }

  public release(sessionId: string): void {
    const assignment = this.assignmentBySession.get(sessionId);

    if (assignment === undefined) {
      return;
    }

    const occupants = this.occupantsByPool.get(assignment.poolKey);

    if (occupants !== undefined) {
      occupants[assignment.index] = undefined;
    }

    this.assignmentBySession.delete(sessionId);
  }

  private keyFor(worker: WorkerState): string | null {
    if (worker.phase === WorkerPhase.AtSpot) {
      return `${WorkerPhase.AtSpot}:${worker.spotType}`;
    }

    if (worker.phase === WorkerPhase.AtCampfire || worker.phase === WorkerPhase.AtTavern) {
      return worker.phase;
    }

    return null;
  }

  private assign(sessionId: string, poolKey: string, capacity: number): number {
    const existing = this.assignmentBySession.get(sessionId);

    if (existing !== undefined && existing.poolKey === poolKey) {
      return existing.index;
    }

    if (existing !== undefined) {
      this.release(sessionId);
    }

    const occupants = this.occupantsByPool.get(poolKey) ?? new Array<string | undefined>(capacity).fill(undefined);
    this.occupantsByPool.set(poolKey, occupants);

    const freeIndex = occupants.findIndex((occupant) => occupant === undefined);
    const index = freeIndex === -1 ? 0 : freeIndex;
    occupants[index] = sessionId;
    this.assignmentBySession.set(sessionId, { poolKey, index });
    return index;
  }
}
