import { VillageGame } from "../game/VillageGame.js";
import { PageBackground } from "../render/PageBackground.js";
import { PageElements } from "./DomRegistry.js";

const VIEWPORT_SIDE_MARGIN = 96;
const RESERVED_VERTICAL_SPACE = 170;

export class WindowManager {
  public constructor(
    private readonly elements: PageElements,
    private readonly background: PageBackground,
    private readonly game: VillageGame,
  ) {}

  public init(): void {
    this.layout();
    window.addEventListener("resize", () => this.layout());
  }

  private layout(): void {
    this.background.paint();
    this.game.resize(
      window.innerWidth - VIEWPORT_SIDE_MARGIN,
      window.innerHeight - RESERVED_VERTICAL_SPACE,
    );
    this.elements.hudEl.style.width = `${this.elements.frameEl.getBoundingClientRect().width}px`;
  }
}
