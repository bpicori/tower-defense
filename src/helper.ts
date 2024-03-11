import { Position } from "./grid";
import { COLS, GRID_CANVAS_ID, ROWS, getCanvasInitialPosition } from "./main";

export const findMousePosition = (cellSize: number, event: MouseEvent) => {
  const canvas = document.getElementById(GRID_CANVAS_ID) as HTMLCanvasElement;
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // get cell position
  const { startX, startY } = getCanvasInitialPosition();
  const cellX = Math.floor((x - startX) / cellSize);
  const cellY = Math.floor((y - startY) / cellSize);

  return { x: cellX, y: cellY };
};

export const generateRandomObstacles = () => {
  const obstacles = new Set<Position>();

  while (obstacles.size < 10) {
    const x = Math.floor(Math.random() * COLS);
    const y = Math.floor(Math.random() * ROWS);
    if (x === 0 && y === 0) continue;
    if (x === COLS - 1 && y === ROWS - 1) continue;
    obstacles.add({ x, y });
  }

  return Array.from(obstacles);
};
