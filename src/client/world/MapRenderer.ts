import { PixelPainter } from "../render/PixelPainter.js";
import { tileVariant } from "../../shared/tileVariant.js";
import { CAMPFIRE, FOREST, MINE, RIVER, SAWMILL, TAVERN, TAVERN_TERRACE, TOWN_HALL, WORLD_HEIGHT, WORLD_WIDTH } from "./WorldMap.js";

const GRASS_TILE_SIZE = 4;
const GRASS_COLORS = ["#4c7a3a", "#427033"];

const RIVER_COLOR = "#2f6fa3";
const RIVER_RIPPLE_COLOR = "#4a8fc4";

const ROCK_COLOR = "#6b6459";
const ROCK_ENTRANCE_COLOR = "#241f1c";
const ROCK_HIGHLIGHT_COLOR = "#8a8378";

const LEAF_COLORS = ["#2e5b2c", "#366b33", "#3d7a3a"];
const TRUNK_COLOR = "#5b3a22";
const SAWMILL_WALL_COLOR = "#8a6640";
const SAWMILL_ROOF_COLOR = "#7a3226";

const TOWN_HALL_WALL_COLOR = "#9c8256";
const TOWN_HALL_ROOF_COLOR = "#8a3a2c";
const FLAG_POLE_COLOR = "#5b3a22";
const FLAG_COLOR = "#e0a736";

const CAMPFIRE_LOG_COLOR = "#5b3a22";
const CAMPFIRE_FLAME_COLOR = "#e8862e";
const CAMPFIRE_FLAME_HIGHLIGHT_COLOR = "#f4b93f";

const TAVERN_WALL_COLOR = "#7a5a3a";
const TAVERN_ROOF_COLOR = "#5b3224";
const TAVERN_WINDOW_COLOR = "#e8b25a";

export class MapRenderer {
  public draw(ctx: CanvasRenderingContext2D): void {
    const painter = new PixelPainter(ctx);
    this.drawGrass(painter);
    this.drawRiver(painter);
    this.drawMine(painter);
    this.drawForest(painter);
    this.drawTownHall(painter);
    this.drawCampfire(painter);
    this.drawTavern(painter);
  }

  private drawGrass(painter: PixelPainter): void {
    for (let y = 0; y < WORLD_HEIGHT; y += GRASS_TILE_SIZE) {
      for (let x = 0; x < WORLD_WIDTH; x += GRASS_TILE_SIZE) {
        const variant = tileVariant(x / GRASS_TILE_SIZE, y / GRASS_TILE_SIZE, GRASS_COLORS.length);
        painter.fillRect(x, y, GRASS_TILE_SIZE, GRASS_TILE_SIZE, GRASS_COLORS[variant] as string);
      }
    }
  }

  private drawRiver(painter: PixelPainter): void {
    painter.fillRect(RIVER.x, RIVER.y, RIVER.width, RIVER.height, RIVER_COLOR);
    for (let y = 4; y < RIVER.height; y += 10) {
      const offset = (y / 10) % 2 === 0 ? 6 : 14;
      painter.fillRect(RIVER.x + offset, y, 6, 2, RIVER_RIPPLE_COLOR);
    }
  }

  private drawMine(painter: PixelPainter): void {
    painter.fillRect(MINE.x, MINE.y, MINE.width, MINE.height, ROCK_COLOR);
    painter.fillRect(MINE.x + 16, MINE.y + 22, 14, 18, ROCK_ENTRANCE_COLOR);
    painter.fillRect(MINE.x + 4, MINE.y - 4, 10, 10, ROCK_HIGHLIGHT_COLOR);
    painter.fillRect(MINE.x + 38, MINE.y + 2, 10, 10, ROCK_HIGHLIGHT_COLOR);
  }

  private drawTree(painter: PixelPainter, x: number, y: number, variant: number): void {
    const leaf = LEAF_COLORS[variant % LEAF_COLORS.length] as string;
    painter.fillRect(x + 1, y + 4, 2, 3, TRUNK_COLOR);
    painter.fillRect(x, y, 4, 4, leaf);
    painter.fillRect(x - 1, y + 1, 6, 2, leaf);
  }

  private drawForest(painter: PixelPainter): void {
    for (let i = 0; i < 9; i++) {
      const treeX = FOREST.x + 8 + (i % 3) * 16;
      const treeY = FOREST.y + 4 + Math.floor(i / 3) * 16;
      this.drawTree(painter, treeX, treeY, tileVariant(i % 3, Math.floor(i / 3), LEAF_COLORS.length));
    }
    painter.fillRect(SAWMILL.x, SAWMILL.y, SAWMILL.width, SAWMILL.height, SAWMILL_WALL_COLOR);
    painter.fillRect(SAWMILL.x - 2, SAWMILL.y - 6, SAWMILL.width + 8, 8, SAWMILL_ROOF_COLOR);
  }

  private drawTownHall(painter: PixelPainter): void {
    painter.fillRect(TOWN_HALL.x + 6, TOWN_HALL.y + 6, TOWN_HALL.width - 12, TOWN_HALL.height - 6, TOWN_HALL_WALL_COLOR);
    painter.fillRect(TOWN_HALL.x, TOWN_HALL.y, TOWN_HALL.width, 10, TOWN_HALL_ROOF_COLOR);
    painter.fillRect(TOWN_HALL.x + TOWN_HALL.width / 2 - 1, TOWN_HALL.y - 6, 2, 6, FLAG_POLE_COLOR);
    painter.fillRect(TOWN_HALL.x + TOWN_HALL.width / 2 + 1, TOWN_HALL.y - 6, 6, 4, FLAG_COLOR);
  }

  private drawCampfire(painter: PixelPainter): void {
    painter.fillRect(CAMPFIRE.x, CAMPFIRE.y + CAMPFIRE.height - 4, CAMPFIRE.width, 4, CAMPFIRE_LOG_COLOR);
    painter.fillRect(CAMPFIRE.x + CAMPFIRE.width / 2 - 1, CAMPFIRE.y - 6, 2, 8, CAMPFIRE_FLAME_COLOR);
    painter.fillRect(CAMPFIRE.x + CAMPFIRE.width / 2 - 2, CAMPFIRE.y - 3, 4, 4, CAMPFIRE_FLAME_HIGHLIGHT_COLOR);
  }

  private drawTavern(painter: PixelPainter): void {
    painter.fillRect(TAVERN.x, TAVERN.y, TAVERN.width, TAVERN.height, TAVERN_WALL_COLOR);
    painter.fillRect(TAVERN.x - 6, TAVERN.y - 8, TAVERN.width + 12, 10, TAVERN_ROOF_COLOR);
    painter.fillRect(TAVERN.x + 12, TAVERN.y + 10, 8, 8, TAVERN_WINDOW_COLOR);
    painter.fillRect(TAVERN.x + 28, TAVERN.y + 10, 8, 8, TAVERN_WINDOW_COLOR);
    painter.fillRect(TAVERN_TERRACE.x, TAVERN_TERRACE.y, TAVERN_TERRACE.width, TAVERN_TERRACE.height, SAWMILL_WALL_COLOR);
  }
}
