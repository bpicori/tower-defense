import { CANVAS_HEIGHT, CANVAS_WIDTH, COLS, OBSTACLES_MAP, Position, ROWS, getCanvasInitialPosition } from "./main";

export enum Direction {
  Up = "Up",
  Down = "Down",
  Left = "Left",
  Right = "Right",
}

export function drawCircle(position: Position) {
  const canvas = document.getElementById("gridCanvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d")!;

  const cellSize = Math.min(CANVAS_WIDTH / COLS, CANVAS_HEIGHT / ROWS);

  const { startX, startY } = getCanvasInitialPosition();

  ctx.beginPath();
  ctx.arc(
    startX + position.x * cellSize + cellSize / 2,
    startY + position.y * cellSize + cellSize / 2,
    cellSize / 4,
    0,
    2 * Math.PI,
  );
  ctx.fillStyle = "red";
  ctx.fill();
  ctx.stroke();
}

export function clearCircle(position: Position) {
  const canvas = document.getElementById("gridCanvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d")!;

  const { startX, startY } = getCanvasInitialPosition();
  const cellSize = Math.min(CANVAS_WIDTH / COLS, CANVAS_HEIGHT / ROWS);

  ctx.clearRect(startX + position.x * cellSize, startY + position.y * cellSize, cellSize, cellSize);
}


export function moveCircle(position: Position, direction: Direction) {
  let { x, y } = position;
  const previousPosition = { ...position };
  switch (direction) {
    case Direction.Up:
      y = Math.max(0, position.y - 1);
      break;
    case Direction.Down:
      y = Math.min(ROWS - 1, position.y + 1);
      break;
    case Direction.Left:
      x = Math.max(0, position.x - 1);
      break;
    case Direction.Right:
      x = Math.min(COLS - 1, position.x + 1);
      break;
  }

  // check if new position has an obstacle
  if (OBSTACLES_MAP.some((obstacle) => obstacle.x === x && obstacle.y === y)) {
    return previousPosition;
  }

  clearCircle(previousPosition);
  drawCircle({ x, y });

  return { x, y };
}
