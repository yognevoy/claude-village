import { texts } from "../../shared/texts.js";

export class SoundGestureHint {
  public constructor(private readonly element: HTMLElement) {
    const titleEl = element.querySelector<HTMLElement>(".sound-hint-title");
    const bodyEl = element.querySelector<HTMLElement>(".sound-hint-body");

    if (!titleEl || !bodyEl) {
      throw new Error("missing required element: .sound-hint-title or .sound-hint-body");
    }

    titleEl.textContent = texts.client.soundGestureHintTitle;
    bodyEl.textContent = texts.client.soundGestureHintBody;
    this.element.hidden = true;
  }

  public setVisible(visible: boolean): void {
    this.element.hidden = !visible;
  }
}
