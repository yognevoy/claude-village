import { VillageGame } from "../game/VillageGame.js";
import { HudPanel } from "../hud/HudPanel.js";
import { PageBackground } from "../render/PageBackground.js";
import { PageElements } from "./DomRegistry.js";
import { WindowManager } from "./WindowManager.js";

export class App {
  public constructor(private readonly elements: PageElements) {}

  public start(): void {
    const background = new PageBackground(this.elements.backgroundCanvasEl);
    const game = new VillageGame(this.elements.gameContainerEl);
    new HudPanel(
      this.elements.titleEl,
      this.elements.stoneCounterEl,
      this.elements.woodCounterEl,
      this.elements.fishCounterEl,
      this.elements.soundButtonEl,
      this.elements.soundLabelEl,
    );
    new WindowManager(this.elements, background, game).init();
  }
}
