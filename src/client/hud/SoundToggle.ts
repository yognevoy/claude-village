import type { BackgroundMusic } from "../audio/BackgroundMusic.js";
import type { ClientSettingsStore } from "../storage/ClientSettingsStore.js";
import { texts } from "../../shared/texts.js";

export class SoundToggle {
  private readonly statusEl: HTMLElement;

  public constructor(
    private readonly buttonEl: HTMLButtonElement,
    private readonly labelEl: HTMLElement,
    private readonly music: BackgroundMusic,
    private readonly settingsStore: ClientSettingsStore,
  ) {
    const statusEl = buttonEl.querySelector<HTMLElement>(".toggle-status");

    if (!statusEl) {
      throw new Error("missing required element: .toggle-status");
    }

    this.statusEl = statusEl;
    this.render();
    this.buttonEl.addEventListener("click", () => {
      this.music.toggle();
      this.settingsStore.update({ soundOn: this.music.isOn });
      this.render();
    });
  }

  private render(): void {
    this.buttonEl.setAttribute("aria-pressed", String(this.music.isOn));
    this.labelEl.textContent = texts.client.soundName;
    this.statusEl.textContent = this.music.isOn ? texts.client.on : texts.client.off;
  }
}
