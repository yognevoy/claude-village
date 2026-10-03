import type { ResourceTotalsView } from "../net/EventStream.js";
import { texts } from "../../shared/texts.js";

export class HudPanel {
  private soundOn = false;

  public constructor(
    private readonly titleEl: HTMLElement,
    private readonly stoneCounterEl: HTMLElement,
    private readonly woodCounterEl: HTMLElement,
    private readonly fishCounterEl: HTMLElement,
    private readonly soundButtonEl: HTMLButtonElement,
    private readonly soundLabelEl: HTMLElement,
  ) {
    this.titleEl.textContent = texts.client.title;
    this.setTotals({ mine: 0, forest: 0, river: 0 });
    this.updateSoundLabel();
    this.soundButtonEl.addEventListener("click", () => {
      this.toggleSound();
    });
  }

  public setTotals(totals: ResourceTotalsView): void {
    const { resourceLabel, resourceCounter } = texts.client;

    this.stoneCounterEl.textContent = resourceCounter(resourceLabel.stone, totals.mine);
    this.woodCounterEl.textContent = resourceCounter(resourceLabel.wood, totals.forest);
    this.fishCounterEl.textContent = resourceCounter(resourceLabel.fish, totals.river);
  }

  private toggleSound(): void {
    this.soundOn = !this.soundOn;
    this.soundButtonEl.setAttribute("aria-pressed", String(this.soundOn));
    this.updateSoundLabel();
  }

  private updateSoundLabel(): void {
    this.soundLabelEl.textContent = this.soundOn
      ? texts.client.soundOn
      : texts.client.soundOff;
  }
}
