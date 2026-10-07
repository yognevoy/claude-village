export interface PageElements {
  readonly backgroundCanvasEl: HTMLCanvasElement;
  readonly gameContainerEl: HTMLElement;
  readonly nameTagsEl: HTMLElement;
  readonly gameColumnEl: HTMLElement;
  readonly sidePanelEl: HTMLElement;
  readonly titleEl: HTMLElement;
  readonly stoneCounterEl: HTMLElement;
  readonly woodCounterEl: HTMLElement;
  readonly fishCounterEl: HTMLElement;
  readonly soundButtonEl: HTMLButtonElement;
  readonly soundLabelEl: HTMLElement;
  readonly notifyButtonEl: HTMLButtonElement;
  readonly notifyLabelEl: HTMLElement;
  readonly sessionsTabButtonEl: HTMLButtonElement;
  readonly settingsTabButtonEl: HTMLButtonElement;
  readonly sessionsTabPanelEl: HTMLElement;
  readonly settingsTabPanelEl: HTMLElement;
  readonly sessionListEl: HTMLUListElement;
  readonly panelToggleButtonEl: HTMLButtonElement;
  readonly themeButtonEl: HTMLButtonElement;
  readonly themeLabelEl: HTMLElement;
  readonly themeStatusEl: HTMLElement;
}

export class DomRegistry {
  public bootstrap(): PageElements {
    const elements = {
      backgroundCanvasEl: document.querySelector<HTMLCanvasElement>("#background"),
      gameContainerEl: document.querySelector<HTMLElement>("#game"),
      nameTagsEl: document.querySelector<HTMLElement>("#name-tags"),
      gameColumnEl: document.querySelector<HTMLElement>(".game-column"),
      sidePanelEl: document.querySelector<HTMLElement>(".side-panel"),
      titleEl: document.querySelector<HTMLElement>("#title"),
      stoneCounterEl: document.querySelector<HTMLElement>("#stone-counter"),
      woodCounterEl: document.querySelector<HTMLElement>("#wood-counter"),
      fishCounterEl: document.querySelector<HTMLElement>("#fish-counter"),
      soundButtonEl: document.querySelector<HTMLButtonElement>("#soundBtn"),
      soundLabelEl: document.querySelector<HTMLElement>("#soundLabel"),
      notifyButtonEl: document.querySelector<HTMLButtonElement>("#notifyBtn"),
      notifyLabelEl: document.querySelector<HTMLElement>("#notifyLabel"),
      sessionsTabButtonEl: document.querySelector<HTMLButtonElement>("#sessionsTabBtn"),
      settingsTabButtonEl: document.querySelector<HTMLButtonElement>("#settingsTabBtn"),
      sessionsTabPanelEl: document.querySelector<HTMLElement>("#sessionsTabPanel"),
      settingsTabPanelEl: document.querySelector<HTMLElement>("#settingsTabPanel"),
      sessionListEl: document.querySelector<HTMLUListElement>("#session-list"),
      panelToggleButtonEl: document.querySelector<HTMLButtonElement>("#panelToggleBtn"),
      themeButtonEl: document.querySelector<HTMLButtonElement>("#themeBtn"),
      themeLabelEl: document.querySelector<HTMLElement>("#themeLabel"),
      themeStatusEl: document.querySelector<HTMLElement>("#themeStatus"),
    };

    for (const [name, element] of Object.entries(elements)) {
      if (!element) {
        throw new Error(`missing page element: ${name}`);
      }
    }

    return elements as PageElements;
  }
}
