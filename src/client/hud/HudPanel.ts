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
    this.setCounters(0, 0, 0);
    this.updateSoundLabel();
    this.soundButtonEl.addEventListener("click", () => {
      this.toggleSound();
    });
  }

  public setCounters(stone: number, wood: number, fish: number): void {
    const { resourceLabel, resourceCounter } = texts.client;

    this.stoneCounterEl.textContent = resourceCounter(resourceLabel.stone, stone);
    this.woodCounterEl.textContent = resourceCounter(resourceLabel.wood, wood);
    this.fishCounterEl.textContent = resourceCounter(resourceLabel.fish, fish);
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
