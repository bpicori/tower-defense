import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  COLS,
  ROWS,
  getCanvasInitialPosition,
  Component,
  GameState,
  ACTION_CANVAS_ID,
} from "./main";

// Position in grid coordinates
export interface Position {
  x: number;
  y: number;
}

export class Grid implements Component {
  cellSize: number;
  constructor() {
    this.cellSize = Math.min(CANVAS_WIDTH / COLS, CANVAS_HEIGHT / ROWS);
  }

  update(state: GameState): GameState {
    return state;
  }

  render(state: GameState): GameState {
    const { obstacles } = state;
    const canvas = document.getElementById(ACTION_CANVAS_ID) as HTMLCanvasElement;
    const ctx = canvas.getContext("2d")!;

    const { x: startX, y: startY } = getCanvasInitialPosition();
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
      const { x: startX, y: startY } = getCanvasInitialPosition();

      ctx.beginPath();
      ctx.rect(startX + obstacle.x * cellSize, startY + obstacle.y * cellSize, cellSize, cellSize);
      ctx.fillStyle = "black";
      ctx.fill();
      ctx.stroke();
    }

    return state;
  }
}
