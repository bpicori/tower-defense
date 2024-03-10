import { CANVAS_HEIGHT, CANVAS_ID, CANVAS_WIDTH, COLS, ROWS, getCanvasInitialPosition } from "./main";
import { drawObstacle } from "./obstacle";

export class Grid {
  cellSize: number;
  constructor() {
    this.cellSize = Math.min(CANVAS_WIDTH / COLS, CANVAS_HEIGHT / ROWS);
    addEventListener("click", (event) => {
      const canvas = document.getElementById(CANVAS_ID) as HTMLCanvasElement;
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // get cell position
      const { startX, startY } = getCanvasInitialPosition();
      const cellX = Math.floor((x - startX) / this.cellSize);
      const cellY = Math.floor((y - startY) / this.cellSize);

      console.log(cellX, cellY);
      drawObstacle({ x: cellX, y: cellY });
    });
  }

  draw() {
    const canvas = document.getElementById(CANVAS_ID) as HTMLCanvasElement;
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
  }
}
