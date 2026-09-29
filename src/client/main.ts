import { HudPanel } from "./hud/HudPanel.js";
import { PageBackground } from "./render/PageBackground.js";
import { PixelCanvas } from "./render/PixelCanvas.js";
import { MapRenderer } from "./world/MapRenderer.js";

const VIEWPORT_SIDE_MARGIN = 96;
const RESERVED_VERTICAL_SPACE = 170;

const backgroundCanvasEl = document.querySelector<HTMLCanvasElement>("#background");
const gameCanvasEl = document.querySelector<HTMLCanvasElement>("#game");
const frameEl = document.querySelector<HTMLElement>("#frame");
const hudEl = document.querySelector<HTMLElement>(".hud");
const titleEl = document.querySelector<HTMLElement>("#title");
const stoneCounterEl = document.querySelector<HTMLElement>("#stone-counter");
const woodCounterEl = document.querySelector<HTMLElement>("#wood-counter");
const fishCounterEl = document.querySelector<HTMLElement>("#fish-counter");
const soundButtonEl = document.querySelector<HTMLButtonElement>("#soundBtn");
const soundLabelEl = document.querySelector<HTMLElement>("#soundLabel");

if (
  backgroundCanvasEl &&
  gameCanvasEl &&
  frameEl &&
  hudEl &&
  titleEl &&
  stoneCounterEl &&
  woodCounterEl &&
  fishCounterEl &&
  soundButtonEl &&
  soundLabelEl
) {
  const frame = frameEl;
  const hud = hudEl;

  const background = new PageBackground(backgroundCanvasEl);
  const pixelCanvas = new PixelCanvas(gameCanvasEl);
  const mapRenderer = new MapRenderer();
  new HudPanel(
    titleEl,
    stoneCounterEl,
    woodCounterEl,
    fishCounterEl,
    soundButtonEl,
    soundLabelEl,
  );

  mapRenderer.draw(pixelCanvas.getContext());

  function layout(): void {
    background.paint();
    pixelCanvas.resize(
      window.innerWidth - VIEWPORT_SIDE_MARGIN,
      window.innerHeight - RESERVED_VERTICAL_SPACE,
    );
    hud.style.width = `${frame.getBoundingClientRect().width}px`;
  }

  layout();
  window.addEventListener("resize", layout);
}
