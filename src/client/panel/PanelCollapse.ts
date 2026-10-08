import type { ClientSettingsStore } from "../storage/ClientSettingsStore.js";
import { texts } from "../../shared/texts.js";

export class PanelCollapse {
  private collapsed: boolean;

  public constructor(
    private readonly panelEl: HTMLElement,
    private readonly toggleEl: HTMLButtonElement,
    private readonly settingsStore: ClientSettingsStore,
    initialCollapsed: boolean,
  ) {
    this.collapsed = initialCollapsed;
    this.toggleEl.setAttribute("aria-label", texts.client.togglePanelLabel);
    this.toggleEl.addEventListener("click", () => this.toggle());
    this.render();
  }

  private toggle(): void {
    this.collapsed = !this.collapsed;
    this.render();
    this.settingsStore.update({ sidebarCollapsed: this.collapsed });
    window.dispatchEvent(new Event("resize"));
  }

  private render(): void {
    this.panelEl.classList.toggle("side-panel--collapsed", this.collapsed);
    this.panelEl.setAttribute("aria-hidden", String(this.collapsed));
    this.toggleEl.setAttribute("aria-expanded", String(!this.collapsed));
    this.toggleEl.textContent = this.collapsed ? texts.client.expandGlyph : texts.client.collapseGlyph;
  }
}
