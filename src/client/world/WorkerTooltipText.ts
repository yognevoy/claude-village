import type { WorkerState } from "../../domain/workers/WorkerState.js";
import { WorkerPhase } from "../../domain/workers/WorkerPhase.js";
import { texts } from "../../shared/texts.js";

const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;

export type TooltipWorker = Pick<
  WorkerState,
  "projectName" | "phase" | "isWorking" | "hasAlert" | "hasQuestion" | "lastEventAt"
>;

export class WorkerTooltipText {
  public lines(worker: TooltipWorker, nowMs: number): string[] {
    const status = WorkerTooltipText.status(worker);
    const ago = WorkerTooltipText.elapsed(nowMs - worker.lastEventAt);

    return [worker.projectName, status, texts.client.tooltip.lastEvent(ago)];
  }

  private static status(worker: TooltipWorker): string {
    const { status } = texts.client.tooltip;

    if (worker.hasAlert) {
      return status.needsPermission;
    }

    if (worker.hasQuestion) {
      return status.needsReply;
    }

    if (worker.phase === WorkerPhase.Resting) {
      return status.resting;
    }

    if (worker.isWorking) {
      return status.working;
    }

    return status.idle;
  }

  private static elapsed(elapsedMs: number): string {
    const { elapsed } = texts.client.tooltip;
    const seconds = Math.max(0, Math.floor(elapsedMs / MS_PER_SECOND));

    if (seconds < SECONDS_PER_MINUTE) {
      return elapsed.seconds(seconds);
    }

    if (seconds < SECONDS_PER_HOUR) {
      return elapsed.minutes(Math.floor(seconds / SECONDS_PER_MINUTE));
    }

    return elapsed.hours(Math.floor(seconds / SECONDS_PER_HOUR));
  }
}
