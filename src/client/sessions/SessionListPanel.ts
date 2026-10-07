import type { WorkerState } from "../../domain/workers/WorkerState.js";
import { WorkerTooltipText } from "../world/WorkerTooltipText.js";

const LEAVE_FALLBACK_MS = 300;

interface SessionRow {
  readonly element: HTMLLIElement;
  readonly projectEl: HTMLElement;
  readonly statusEl: HTMLElement;
  readonly timeEl: HTMLElement;
}

export class SessionListPanel {
  private readonly tooltipText = new WorkerTooltipText();
  private readonly rows = new Map<string, SessionRow>();

  public constructor(private readonly listEl: HTMLUListElement) {}

  public sync(workers: readonly WorkerState[]): void {
    const activeIds = new Set(workers.map((worker) => worker.sessionId));

    for (const sessionId of this.rows.keys()) {
      if (!activeIds.has(sessionId)) {
        this.remove(sessionId);
      }
    }

    for (const worker of workers) {
      this.update(worker);
    }
  }

  public update(worker: WorkerState): void {
    if (worker.removed) {
      this.remove(worker.sessionId);
      return;
    }

    const row = this.rows.get(worker.sessionId) ?? this.createRow(worker.sessionId);
    const [projectName, status, lastEvent] = this.tooltipText.lines(worker, Date.now());

    row.projectEl.textContent = projectName ?? "";
    row.statusEl.textContent = status ?? "";
    row.timeEl.textContent = lastEvent ?? "";
  }

  private createRow(sessionId: string): SessionRow {
    const element = document.createElement("li");
    element.className = "session-row";

    const projectEl = document.createElement("span");
    projectEl.className = "session-project";

    const statusEl = document.createElement("span");
    statusEl.className = "session-status";

    const timeEl = document.createElement("span");
    timeEl.className = "session-time";

    element.append(projectEl, statusEl, timeEl);
    this.listEl.appendChild(element);

    const row: SessionRow = { element, projectEl, statusEl, timeEl };
    this.rows.set(sessionId, row);
    return row;
  }

  private remove(sessionId: string): void {
    const row = this.rows.get(sessionId);

    if (row === undefined) {
      return;
    }

    this.rows.delete(sessionId);

    const finish = (): void => row.element.remove();

    row.element.classList.add("session-row--leaving");
    row.element.addEventListener("animationend", finish, { once: true });
    setTimeout(finish, LEAVE_FALLBACK_MS);
  }
}
