import type { BackgroundMusic } from "../audio/BackgroundMusic.js";
import { texts } from "../../shared/texts.js";

export class SoundToggle {
  public constructor(
    private readonly buttonEl: HTMLButtonElement,
    private readonly labelEl: HTMLElement,
    private readonly music: BackgroundMusic,
  ) {
    this.render();
    this.buttonEl.addEventListener("click", () => {
      this.music.toggle();
      this.render();
    });
  }

  private render(): void {
    this.buttonEl.setAttribute("aria-pressed", String(this.music.isOn));
    this.labelEl.textContent = this.music.isOn ? texts.client.soundOn : texts.client.soundOff;
  }
}
