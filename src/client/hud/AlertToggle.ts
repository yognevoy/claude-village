import type { AlertNotifier } from "../notifications/AlertNotifier.js";
import { texts } from "../../shared/texts.js";

export class AlertToggle {
  private readonly statusEl: HTMLElement;

  public constructor(
    private readonly buttonEl: HTMLButtonElement,
    private readonly labelEl: HTMLElement,
    private readonly notifier: AlertNotifier,
  ) {
    const statusEl = buttonEl.querySelector<HTMLElement>(".toggle-status");

    if (!statusEl) {
      throw new Error("missing required element: .toggle-status");
    }

    this.statusEl = statusEl;
    this.render();
    this.buttonEl.addEventListener("click", () => {
      void this.notifier.toggle().then(() => this.render());
    });
  }

  private render(): void {
    this.buttonEl.setAttribute("aria-pressed", String(this.notifier.isOn));
    this.labelEl.textContent = texts.client.alertsName;
    this.statusEl.textContent = this.notifier.isOn ? texts.client.on : texts.client.off;
  }
}
