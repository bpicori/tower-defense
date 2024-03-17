import { COLS, ROWS, getCanvasInitialPosition, Component, GameState, ACTION_CANVAS_ID, CELL_SIZE } from "./main";

export class Grid implements Component {
  constructor() {}

  update(state: GameState): GameState {
    return state;
  }

  render(state: GameState) {
    const { obstacles } = state;
    const canvas = document.getElementById(ACTION_CANVAS_ID) as HTMLCanvasElement;
    const ctx = canvas.getContext("2d")!;

    const { x: startX, y: startY } = getCanvasInitialPosition();
    ctx.beginPath();

    for (let i = 0; i <= COLS; i++) {
      ctx.moveTo(startX + i * CELL_SIZE, startY);
      ctx.lineTo(startX + i * CELL_SIZE, startY + CELL_SIZE * ROWS);
    }

    for (let i = 0; i <= ROWS; i++) {
      ctx.moveTo(startX, startY + i * CELL_SIZE);
      ctx.lineTo(startX + CELL_SIZE * COLS, startY + i * CELL_SIZE);
    }

    ctx.strokeStyle = "black";
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Draw obstacles
    for (const obstacle of obstacles) {
      ctx.beginPath();
      ctx.rect(startX + obstacle.row * CELL_SIZE, startY + obstacle.col * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      ctx.fillStyle = "black";
      ctx.fill();
      ctx.stroke();
    }
  }
}
