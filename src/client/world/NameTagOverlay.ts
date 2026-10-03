import { NAME_TAG_HEIGHT_PX, WorkerLabel } from "./WorkerLabel.js";
import type { Point } from "./WorldMap.js";

export class NameTagOverlay {
  private canvas: HTMLCanvasElement | undefined;

  public constructor(
    public readonly root: HTMLElement,
    private readonly gameContainer: HTMLElement,
  ) {}

  public createLabel(): WorkerLabel {
    const element = document.createElement("div");
    element.className = "name-tag";
    element.style.height = `${NAME_TAG_HEIGHT_PX}px`;
    this.root.appendChild(element);

    return new WorkerLabel(element);
  }

  public toPagePoint(point: Point): Point {
    const canvas = this.gameCanvas();
    const scaleX = canvas.clientWidth / canvas.width;
    const scaleY = canvas.clientHeight / canvas.height;

    return { x: point.x * scaleX, y: point.y * scaleY };
  }

  private gameCanvas(): HTMLCanvasElement {
    if (this.canvas === undefined) {
      const canvas = this.gameContainer.querySelector("canvas");

      if (canvas === null) {
        throw new Error("game canvas is not mounted yet");
      }

      this.canvas = canvas;
    }

    return this.canvas;
  }
}
