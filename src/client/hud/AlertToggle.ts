import type { AlertNotifier } from "../notifications/AlertNotifier.js";
import { texts } from "../../shared/texts.js";

export class AlertToggle {
  public constructor(
    private readonly buttonEl: HTMLButtonElement,
    private readonly labelEl: HTMLElement,
    private readonly notifier: AlertNotifier,
  ) {
    this.render();
    this.buttonEl.addEventListener("click", () => {
      void this.notifier.toggle().then(() => this.render());
    });
  }

  private render(): void {
    this.buttonEl.setAttribute("aria-pressed", String(this.notifier.isOn));
    this.labelEl.textContent = this.notifier.isOn
      ? texts.client.notificationsOn
      : texts.client.notificationsOff;
  }
}
