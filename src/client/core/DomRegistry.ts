export interface PageElements {
  readonly backgroundCanvasEl: HTMLCanvasElement;
  readonly gameContainerEl: HTMLElement;
  readonly nameTagsEl: HTMLElement;
  readonly frameEl: HTMLElement;
  readonly hudEl: HTMLElement;
  readonly titleEl: HTMLElement;
  readonly stoneCounterEl: HTMLElement;
  readonly woodCounterEl: HTMLElement;
  readonly fishCounterEl: HTMLElement;
  readonly soundButtonEl: HTMLButtonElement;
  readonly soundLabelEl: HTMLElement;
  readonly notifyButtonEl: HTMLButtonElement;
  readonly notifyLabelEl: HTMLElement;
}

export class DomRegistry {
  public bootstrap(): PageElements {
    const elements = {
      backgroundCanvasEl: document.querySelector<HTMLCanvasElement>("#background"),
      gameContainerEl: document.querySelector<HTMLElement>("#game"),
      nameTagsEl: document.querySelector<HTMLElement>("#name-tags"),
      frameEl: document.querySelector<HTMLElement>("#frame"),
      hudEl: document.querySelector<HTMLElement>(".hud"),
      titleEl: document.querySelector<HTMLElement>("#title"),
      stoneCounterEl: document.querySelector<HTMLElement>("#stone-counter"),
      woodCounterEl: document.querySelector<HTMLElement>("#wood-counter"),
      fishCounterEl: document.querySelector<HTMLElement>("#fish-counter"),
      soundButtonEl: document.querySelector<HTMLButtonElement>("#soundBtn"),
      soundLabelEl: document.querySelector<HTMLElement>("#soundLabel"),
      notifyButtonEl: document.querySelector<HTMLButtonElement>("#notifyBtn"),
      notifyLabelEl: document.querySelector<HTMLElement>("#notifyLabel"),
    };

    for (const [name, element] of Object.entries(elements)) {
      if (!element) {
        throw new Error(`missing page element: ${name}`);
      }
    }

    return elements as PageElements;
  }
}
