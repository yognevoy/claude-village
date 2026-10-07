import trackUrl from "../assets/peaceful-theme.mp3?url";
import { BackgroundMusic } from "../audio/BackgroundMusic.js";
import { VillageGame } from "../game/VillageGame.js";
import { HudPanel } from "../hud/HudPanel.js";
import { AlertNotifier } from "../notifications/AlertNotifier.js";
import { PanelCollapse } from "../panel/PanelCollapse.js";
import { SidePanelTabs } from "../panel/SidePanelTabs.js";
import { PageBackground } from "../render/PageBackground.js";
import { SessionListPanel } from "../sessions/SessionListPanel.js";
import { NameTagOverlay } from "../world/NameTagOverlay.js";
import { PageElements } from "./DomRegistry.js";
import { WindowManager } from "./WindowManager.js";

export class App {
  public constructor(private readonly elements: PageElements) {}

  public start(): void {
    const background = new PageBackground(this.elements.backgroundCanvasEl);
    const music = new BackgroundMusic(trackUrl);
    const notifier = new AlertNotifier();
    const hud = new HudPanel(
      this.elements.titleEl,
      this.elements.stoneCounterEl,
      this.elements.woodCounterEl,
      this.elements.fishCounterEl,
      this.elements.soundButtonEl,
      this.elements.soundLabelEl,
      music,
      this.elements.notifyButtonEl,
      this.elements.notifyLabelEl,
      notifier,
    );
    new SidePanelTabs(
      this.elements.sessionsTabButtonEl,
      this.elements.settingsTabButtonEl,
      this.elements.sessionsTabPanelEl,
      this.elements.settingsTabPanelEl,
    );
    new PanelCollapse(this.elements.sidePanelEl, this.elements.panelToggleButtonEl);
    const nameTags = new NameTagOverlay(this.elements.nameTagsEl, this.elements.gameContainerEl);
    const sessionList = new SessionListPanel(this.elements.sessionListEl);
    const game = new VillageGame(this.elements.gameContainerEl, nameTags, hud, notifier, sessionList);
    new WindowManager(this.elements, background, game).init();
  }
}
