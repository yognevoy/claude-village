import { texts } from "../../shared/texts.js";
import type { ClientSettingsStore } from "../storage/ClientSettingsStore.js";

interface Theme {
  readonly id: string;
  readonly attribute: string | undefined;
  readonly name: string;
}

export class ThemePicker {
  private readonly themes: readonly Theme[] = [
    { id: "wood", attribute: undefined, name: texts.client.themeWood },
    { id: "dusk", attribute: "g3", name: texts.client.themeDusk },
    { id: "amber", attribute: "g4", name: texts.client.themeAmber },
    { id: "weave", attribute: "o3", name: texts.client.themeWeave },
  ];

  private index: number;

  public constructor(
    private readonly buttonEl: HTMLButtonElement,
    private readonly labelEl: HTMLElement,
    private readonly statusEl: HTMLElement,
    private readonly settingsStore: ClientSettingsStore,
    initialThemeId: string,
  ) {
    this.labelEl.textContent = texts.client.themeLabel;
    this.index = this.indexForId(initialThemeId);
    this.render();
    this.buttonEl.addEventListener("click", () => this.next());
  }

  private indexForId(id: string): number {
    const index = this.themes.findIndex((theme) => theme.id === id);

    return index === -1 ? 0 : index;
  }

  private next(): void {
    this.index = (this.index + 1) % this.themes.length;
    this.render();

    const theme = this.themes[this.index];

    if (theme !== undefined) {
      this.settingsStore.update({ themeId: theme.id });
    }
  }

  private render(): void {
    const theme = this.themes[this.index];

    if (theme === undefined) {
      return;
    }

    this.statusEl.textContent = theme.name;

    if (theme.attribute === undefined) {
      document.body.removeAttribute("data-board-bg");
      return;
    }

    document.body.setAttribute("data-board-bg", theme.attribute);
  }
}
