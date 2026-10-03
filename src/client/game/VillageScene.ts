import Phaser from "phaser";
import atlasImageUrl from "../../../sprites/atlas.png?url";
import atlasJsonUrl from "../../../sprites/atlas.json?url";
import terrainImageUrl from "../../../sprites/terrain.png?url";
import { EventStream } from "../net/EventStream.js";
import type { HudPanel } from "../hud/HudPanel.js";
import { WorkerLayer } from "../world/WorkerLayer.js";
import { MapRenderer } from "./MapRenderer.js";
import { WorkerAnimations } from "./WorkerAnimations.js";

export const SPRITE_ATLAS_KEY = "sprites";
export const TERRAIN_TILESET_KEY = "terrain";

export class VillageScene extends Phaser.Scene {
  private eventStream: EventStream | undefined;

  public constructor(private readonly hud: HudPanel) {
    super("village");
  }

  public preload(): void {
    this.load.atlas(SPRITE_ATLAS_KEY, atlasImageUrl, atlasJsonUrl);
    this.load.image(TERRAIN_TILESET_KEY, terrainImageUrl);
  }

  public create(): void {
    new MapRenderer(this, SPRITE_ATLAS_KEY, TERRAIN_TILESET_KEY).render();
    WorkerAnimations.register(this, SPRITE_ATLAS_KEY);

    const workerLayer = new WorkerLayer(this, SPRITE_ATLAS_KEY);
    this.eventStream = new EventStream("/events", {
      onSnapshot: (workers) => workerLayer.sync(workers),
      onDelta: (worker) => workerLayer.update(worker),
      onResources: (totals) => this.hud.setTotals(totals),
    });
  }
}
