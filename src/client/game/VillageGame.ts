import Phaser from "phaser";
import type { HudPanel } from "../hud/HudPanel.js";
import type { AlertNotifier } from "../notifications/AlertNotifier.js";
import type { SessionListPanel } from "../sessions/SessionListPanel.js";
import type { NameTagOverlay } from "../world/NameTagOverlay.js";
import { WORLD_HEIGHT, WORLD_WIDTH } from "../world/WorldMap.js";
import { VillageScene } from "./VillageScene.js";

const MAX_ZOOM = 3;

export class VillageGame {
  private readonly game: Phaser.Game;

  public constructor(
    parent: HTMLElement,
    overlay: NameTagOverlay,
    hud: HudPanel,
    notifier: AlertNotifier,
    sessionList: SessionListPanel,
    onReady: () => void,
  ) {
    const scene = new VillageScene(hud, overlay, notifier, sessionList, onReady);

    this.game = new Phaser.Game({
      type: Phaser.AUTO,
      parent,
      width: WORLD_WIDTH,
      height: WORLD_HEIGHT,
      pixelArt: true,
      backgroundColor: "#1a1a1a",
      scale: {
        mode: Phaser.Scale.NONE,
        zoom: 1,
      },
      scene: [scene],
    });
  }

  public resize(availableWidth: number, availableHeight: number): void {
    const fitZoom = Math.floor(Math.min(availableWidth / WORLD_WIDTH, availableHeight / WORLD_HEIGHT));
    const zoom = Math.max(1, Math.min(MAX_ZOOM, fitZoom));
    this.game.scale.setZoom(zoom);
  }
}
