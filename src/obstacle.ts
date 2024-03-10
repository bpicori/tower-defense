import { CANVAS_HEIGHT, CANVAS_WIDTH, COLS, Position, ROWS, getCanvasInitialPosition } from "./main";

export function drawObstacle(position: Position) {
  const canvas = document.getElementById("gridCanvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d")!;

  const cellSize = Math.min(CANVAS_WIDTH / COLS, CANVAS_HEIGHT / ROWS);
  const { startX, startY } = getCanvasInitialPosition();

  ctx.beginPath();
  ctx.rect(startX + position.x * cellSize, startY + position.y * cellSize, cellSize, cellSize);
  ctx.fillStyle = "black";
  ctx.fill();
  ctx.stroke();
}
