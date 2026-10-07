import { texts } from "../../shared/texts.js";

interface Theme {
  readonly attribute: string | undefined;
  readonly name: string;
}

export class ThemePicker {
  private readonly themes: readonly Theme[] = [
    { attribute: undefined, name: texts.client.themeWood },
    { attribute: "g3", name: texts.client.themeDusk },
    { attribute: "g4", name: texts.client.themeAmber },
    { attribute: "o3", name: texts.client.themeWeave },
  ];

  private index = 0;

  public constructor(
    private readonly buttonEl: HTMLButtonElement,
    private readonly labelEl: HTMLElement,
    private readonly statusEl: HTMLElement,
  ) {
    this.labelEl.textContent = texts.client.themeLabel;
    this.render();
    this.buttonEl.addEventListener("click", () => this.next());
  }

  private next(): void {
    this.index = (this.index + 1) % this.themes.length;
    this.render();
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
