import trackUrl from "../assets/peaceful-theme.mp3?url";
import { BackgroundMusic } from "../audio/BackgroundMusic.js";
import { VillageGame } from "../game/VillageGame.js";
import { HudPanel } from "../hud/HudPanel.js";
import { PageBackground } from "../render/PageBackground.js";
import { NameTagOverlay } from "../world/NameTagOverlay.js";
import { PageElements } from "./DomRegistry.js";
import { WindowManager } from "./WindowManager.js";

export class App {
  public constructor(private readonly elements: PageElements) {}

  public start(): void {
    const background = new PageBackground(this.elements.backgroundCanvasEl);
    const music = new BackgroundMusic(trackUrl);
    const hud = new HudPanel(
      this.elements.titleEl,
      this.elements.stoneCounterEl,
      this.elements.woodCounterEl,
      this.elements.fishCounterEl,
      this.elements.soundButtonEl,
      this.elements.soundLabelEl,
      music,
    );
    const nameTags = new NameTagOverlay(this.elements.nameTagsEl, this.elements.gameContainerEl);
    const game = new VillageGame(this.elements.gameContainerEl, nameTags, hud);
    new WindowManager(this.elements, background, game).init();
  }
}
