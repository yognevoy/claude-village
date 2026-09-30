import { VillageGame } from "../game/VillageGame.js";
import { HudPanel } from "../hud/HudPanel.js";
import { PageBackground } from "../render/PageBackground.js";
import { SPRITE_ATLAS_XOR_KEY } from "../sprites/atlasEncoding.js";
import { SpriteAtlasLoader } from "../sprites/SpriteAtlasLoader.js";
import { XorCodec } from "../sprites/XorCodec.js";
import { PageElements } from "./DomRegistry.js";
import { WindowManager } from "./WindowManager.js";

export class App {
  public constructor(private readonly elements: PageElements) {}

  public async start(): Promise<void> {
    const background = new PageBackground(this.elements.backgroundCanvasEl);
    const atlasLoader = new SpriteAtlasLoader(new XorCodec(SPRITE_ATLAS_XOR_KEY));
    const atlas = await atlasLoader.load("sprites/sprites.bin", "sprites/sprites.json");
    const game = new VillageGame(this.elements.gameContainerEl, atlas.image, atlas.json);
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
