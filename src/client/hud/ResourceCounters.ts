import type { ResourceTotalsView } from "../net/EventStream.js";
import { texts } from "../../shared/texts.js";

export class ResourceCounters {
  public constructor(
    private readonly stoneCounterEl: HTMLElement,
    private readonly woodCounterEl: HTMLElement,
    private readonly fishCounterEl: HTMLElement,
  ) {}

  public setTotals(totals: ResourceTotalsView): void {
    const { resourceLabel, resourceCounter } = texts.client;

    this.stoneCounterEl.textContent = resourceCounter(resourceLabel.stone, totals.mine);
    this.woodCounterEl.textContent = resourceCounter(resourceLabel.wood, totals.forest);
    this.fishCounterEl.textContent = resourceCounter(resourceLabel.fish, totals.river);
  }
}
