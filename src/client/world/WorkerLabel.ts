import type { WorkerState } from "../../domain/workers/WorkerState.js";
import type { Point } from "./WorldMap.js";

const LABEL_MAX_LENGTH = 12;
const ELLIPSIS = "…";
export const NAME_TAG_HEIGHT_PX = 16;

export interface LabelElement {
  textContent: string | null;
  readonly style: { left: string; top: string };
  remove(): void;
}

export class WorkerLabel {
  public constructor(private readonly element: LabelElement) {}

  public update(worker: Pick<WorkerState, "projectName">): void {
    const text = WorkerLabel.shorten(worker.projectName);

    if (this.element.textContent !== text) {
      this.element.textContent = text;
    }
  }

  public moveTo(point: Point): void {
    this.element.style.left = `${point.x}px`;
    this.element.style.top = `${point.y}px`;
  }

  public destroy(): void {
    this.element.remove();
  }

  private static shorten(name: string): string {
    if (name.length <= LABEL_MAX_LENGTH) {
      return name;
    }

    const kept = name.slice(0, LABEL_MAX_LENGTH - ELLIPSIS.length);

    return `${kept}${ELLIPSIS}`;
  }
}
