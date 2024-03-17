import { COLS, ROWS, getCanvasInitialPosition, Component, GameState, ACTION_CANVAS_ID, CELL_SIZE } from "./main";
import sprite from "./sprite.svg";
import { GridPosition } from "./utils/helper";

const SpriteMap = {
  ROAD: { x: 1281, y: 386, width: 60, height: 60 },
  OBSTACLE: {
    x: 1219,
    y: 386,
    width: 60,
    height: 60,
  },
};

export class Grid implements Component {
  image: HTMLImageElement;
  loaded: boolean;
  constructor() {
    this.image = new Image();
    this.image.src = sprite;
    this.loaded = false;
  }

  update(state: GameState): GameState {
    return state;
  }

  render(state: GameState) {
    const { obstacles } = state;
    const canvas = document.getElementById(ACTION_CANVAS_ID) as HTMLCanvasElement;
    const ctx = canvas.getContext("2d")!;

    // Draw obstacles
    for (const obstacle of obstacles) {
      this.drawObstacle(ctx, obstacle);
    }

    // draw road
    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        if (obstacles.some((obstacle) => obstacle.row === i && obstacle.col === j)) {
          continue;
        }
        this.drawRoad(ctx, { row: i, col: j });
      }
    }
  }

  private drawRoad(ctx: CanvasRenderingContext2D, position: GridPosition) {
    const { x: startX, y: startY } = getCanvasInitialPosition();
    const { x, y, width, height } = SpriteMap.ROAD;
    ctx.drawImage(
      this.image,
      x,
      y,
      width,
      height,
      startX + position.row * CELL_SIZE,
      startY + position.col * CELL_SIZE,
      CELL_SIZE,
      CELL_SIZE,
    );
  }

  private drawObstacle(ctx: CanvasRenderingContext2D, position: GridPosition) {
    const { x: startX, y: startY } = getCanvasInitialPosition();
    const { x, y, width, height } = SpriteMap.OBSTACLE;
    ctx.drawImage(
      this.image,
      x,
      y,
      width,
      height,
      startX + position.row * CELL_SIZE,
      startY + position.col * CELL_SIZE,
      CELL_SIZE,
      CELL_SIZE,
    );
  }
}
