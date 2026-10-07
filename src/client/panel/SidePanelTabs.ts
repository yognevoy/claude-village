import { texts } from "../../shared/texts.js";

export class SidePanelTabs {
  private sessionsActive = true;

  public constructor(
    private readonly sessionsTabEl: HTMLButtonElement,
    private readonly settingsTabEl: HTMLButtonElement,
    private readonly sessionsPanelEl: HTMLElement,
    private readonly settingsPanelEl: HTMLElement,
  ) {
    this.sessionsTabEl.textContent = texts.client.sessionsTitle;
    this.settingsTabEl.textContent = texts.client.settingsLabel;

    this.sessionsTabEl.addEventListener("click", () => this.select(true));
    this.settingsTabEl.addEventListener("click", () => this.select(false));
  }

  private select(sessionsActive: boolean): void {
    this.sessionsActive = sessionsActive;
    this.render();
  }

  private render(): void {
    this.sessionsTabEl.setAttribute("aria-selected", String(this.sessionsActive));
    this.settingsTabEl.setAttribute("aria-selected", String(!this.sessionsActive));
    this.sessionsPanelEl.hidden = !this.sessionsActive;
    this.settingsPanelEl.hidden = this.sessionsActive;
  }
}
