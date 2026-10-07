import Phaser from "phaser";
import atlasImageUrl from "../../../sprites/atlas.png?url";
import atlasJsonUrl from "../../../sprites/atlas.json?url";
import terrainImageUrl from "../../../sprites/terrain.png?url";
import { EventStream } from "../net/EventStream.js";
import type { HudPanel } from "../hud/HudPanel.js";
import type { AlertNotifier } from "../notifications/AlertNotifier.js";
import type { SessionListPanel } from "../sessions/SessionListPanel.js";
import type { NameTagOverlay } from "../world/NameTagOverlay.js";
import { WorkerLayer } from "../world/WorkerLayer.js";
import { MapRenderer } from "./MapRenderer.js";
import { WorkerAnimations } from "./WorkerAnimations.js";

export const SPRITE_ATLAS_KEY = "sprites";
export const TERRAIN_TILESET_KEY = "terrain";

export class VillageScene extends Phaser.Scene {
  private eventStream: EventStream | undefined;
  private workerLayer: WorkerLayer | undefined;

  public constructor(
    private readonly hud: HudPanel,
    private readonly overlay: NameTagOverlay,
    private readonly notifier: AlertNotifier,
    private readonly sessionList: SessionListPanel,
  ) {
    super("village");
  }

  public preload(): void {
    this.load.atlas(SPRITE_ATLAS_KEY, atlasImageUrl, atlasJsonUrl);
    this.load.image(TERRAIN_TILESET_KEY, terrainImageUrl);
  }

  public create(): void {
    new MapRenderer(this, SPRITE_ATLAS_KEY, TERRAIN_TILESET_KEY).render();
    WorkerAnimations.register(this, SPRITE_ATLAS_KEY);

    const workerLayer = new WorkerLayer(this, SPRITE_ATLAS_KEY, this.overlay, this.notifier);
    this.workerLayer = workerLayer;

    this.eventStream = new EventStream("/events", {
      onSnapshot: (workers) => {
        workerLayer.sync(workers);
        this.sessionList.sync(workers);
      },
      onDelta: (worker) => {
        workerLayer.update(worker);
        this.sessionList.update(worker);
      },
      onResources: (totals) => this.hud.counters.setTotals(totals),
    });
  }

  public update(): void {
    this.workerLayer?.refresh(Date.now());
  }
}
