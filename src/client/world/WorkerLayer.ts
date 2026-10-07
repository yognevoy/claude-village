import type Phaser from "phaser";
import { WorkerPhase } from "../../domain/workers/WorkerPhase.js";
import type { WorkerState } from "../../domain/workers/WorkerState.js";
import type { AlertNotifier } from "../notifications/AlertNotifier.js";
import type { NameTagOverlay } from "./NameTagOverlay.js";
import { WorkerPlacement } from "./WorkerPlacement.js";
import type { WorkerPointerListener } from "./WorkerView.js";
import { WorkerView } from "./WorkerView.js";
import { WorkerTooltip } from "./WorkerTooltip.js";
import { WorkerTooltipText } from "./WorkerTooltipText.js";
import { TOWN_HALL_SPAWN } from "./WorldMap.js";

export class WorkerLayer implements WorkerPointerListener {
  private readonly placement = new WorkerPlacement();
  private readonly views = new Map<string, WorkerView>();
  private readonly tooltip: WorkerTooltip;
  private readonly tooltipText = new WorkerTooltipText();
  private hoveredId: string | undefined;
  private pinnedId: string | undefined;

  public constructor(
    private readonly scene: Phaser.Scene,
    private readonly atlasKey: string,
    private readonly overlay: NameTagOverlay,
    private readonly notifier: AlertNotifier,
  ) {
    this.tooltip = new WorkerTooltip(overlay.root);
  }

  public sync(workers: readonly WorkerState[]): void {
    const sessionIds = new Set(workers.map((worker) => worker.sessionId));

    for (const sessionId of this.views.keys()) {
      if (!sessionIds.has(sessionId)) {
        this.remove(sessionId);
      }
    }

    for (const worker of workers) {
      this.place(worker);
    }
  }

  public update(worker: WorkerState): void {
    if (worker.removed) {
      this.leave(worker.sessionId);
      return;
    }

    const previous = this.views.get(worker.sessionId)?.currentState;

    this.place(worker);

    if (worker.hasAlert && previous?.hasAlert !== true) {
      this.notifier.notify(worker);
    }
  }

  public refresh(nowMs: number): void {
    for (const view of this.views.values()) {
      view.placeOverlays(this.overlay);
    }

    this.refreshTooltip(nowMs);
  }

  public onHoverStart(sessionId: string): void {
    this.hoveredId = sessionId;
  }

  public onHoverEnd(sessionId: string): void {
    if (this.hoveredId === sessionId) {
      this.hoveredId = undefined;
    }
  }

  public onPress(sessionId: string): void {
    this.pinnedId = this.pinnedId === sessionId ? undefined : sessionId;
  }

  private refreshTooltip(nowMs: number): void {
    const shownId = this.pinnedId ?? this.hoveredId;
    const view = shownId === undefined ? undefined : this.views.get(shownId);
    const worker = view?.currentState;

    if (view === undefined || worker === undefined) {
      this.tooltip.hide();
      return;
    }

    const lines = this.tooltipText.lines(worker, nowMs);
    const point = this.overlay.toPagePoint(view.tooltipAnchor());
    this.tooltip.show(lines, point);
  }

  private place(worker: WorkerState): void {
    if (worker.phase === WorkerPhase.Queued) {
      this.remove(worker.sessionId);
      return;
    }

    if (worker.phase === WorkerPhase.Gone) {
      this.leave(worker.sessionId);
      return;
    }

    const target = this.placement.place(worker);
    let view = this.views.get(worker.sessionId);

    if (view === undefined) {
      const label = this.overlay.createLabel();
      view = new WorkerView(
        this.scene,
        this.atlasKey,
        TOWN_HALL_SPAWN,
        worker.spotType,
        label,
        worker.sessionId,
        this,
      );
      this.views.set(worker.sessionId, view);
    }

    view.syncState(worker, target);
  }

  private leave(sessionId: string): void {
    this.placement.release(sessionId);
    this.views.get(sessionId)?.leave(() => this.remove(sessionId));
  }

  private remove(sessionId: string): void {
    this.placement.release(sessionId);
    this.views.get(sessionId)?.destroy();
    this.views.delete(sessionId);

    if (this.hoveredId === sessionId) {
      this.hoveredId = undefined;
    }

    if (this.pinnedId === sessionId) {
      this.pinnedId = undefined;
    }
  }
}
