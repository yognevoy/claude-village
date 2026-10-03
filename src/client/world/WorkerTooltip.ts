import type { Point } from "./WorldMap.js";

export class WorkerTooltip {
  private readonly element: HTMLElement;

  public constructor(root: HTMLElement) {
    this.element = document.createElement("div");
    this.element.className = "worker-tooltip";
    this.element.hidden = true;
    root.appendChild(this.element);
  }

  public show(lines: readonly string[], point: Point): void {
    const text = lines.join("\n");

    if (this.element.textContent !== text) {
      this.element.textContent = text;
    }

    this.element.style.left = `${point.x}px`;
    this.element.style.top = `${point.y}px`;
    this.element.hidden = false;
  }

  public hide(): void {
    this.element.hidden = true;
  }
}
