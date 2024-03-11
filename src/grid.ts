import {
  CANVAS_HEIGHT,
  GRID_CANVAS_ID,
  CANVAS_WIDTH,
  COLS,
  ROWS,
  getCanvasInitialPosition,
  Component,
  GameState,
} from "./main";

// Position in grid coordinates
export interface Position {
  x: number;
  y: number;
}

export class Grid implements Component {
  cellSize: number;
  loaded: boolean = false;
  constructor() {
    this.cellSize = Math.min(CANVAS_WIDTH / COLS, CANVAS_HEIGHT / ROWS);
  }

  updateState(state: GameState) {
    return state;
  }

  render(state: GameState) {
    if (this.loaded) return;
    const { obstacles } = state;
    const canvas = document.getElementById(GRID_CANVAS_ID) as HTMLCanvasElement;
    const ctx = canvas.getContext("2d")!;

    const { startX, startY } = getCanvasInitialPosition();
    ctx.beginPath();

    for (let i = 0; i <= COLS; i++) {
      ctx.moveTo(startX + i * this.cellSize, startY);
      ctx.lineTo(startX + i * this.cellSize, startY + this.cellSize * ROWS);
    }

    for (let i = 0; i <= ROWS; i++) {
      ctx.moveTo(startX, startY + i * this.cellSize);
      ctx.lineTo(startX + this.cellSize * COLS, startY + i * this.cellSize);
    }

    ctx.strokeStyle = "black";
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Draw obstacles
    for (const obstacle of obstacles) {
      const cellSize = Math.min(CANVAS_WIDTH / COLS, CANVAS_HEIGHT / ROWS);
      const { startX, startY } = getCanvasInitialPosition();

      ctx.beginPath();
      ctx.rect(startX + obstacle.x * cellSize, startY + obstacle.y * cellSize, cellSize, cellSize);
      ctx.fillStyle = "black";
      ctx.fill();
      ctx.stroke();
    }

    this.loaded = true;
  }
}
