import { Direction, clearCircle, drawCircle, moveCircle } from "./circle";
import { Grid } from "./grid";
import { GridNavigator } from "./navigator";
import { drawObstacle } from "./obstacle";

export const CANVAS_ID = "gridCanvas";
export const CANVAS_WIDTH = 1440;
export const CANVAS_HEIGHT = 900;

export const ROWS = 10;
export const COLS = 10;

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div style="display: flex; justify-content: center; align-items: center;">
      <canvas id=${CANVAS_ID} width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}"></canvas>
  </div>
`;

// Position in grid coordinates
export interface Position {
  x: number;
  y: number;
}

export function getCanvasInitialPosition() {
  const canvas = document.getElementById("gridCanvas") as HTMLCanvasElement;

  const gridWidth = (CANVAS_WIDTH / COLS) * COLS;
  const gridHeight = (CANVAS_HEIGHT / ROWS) * ROWS;

  const startX = (canvas.width - gridWidth) / 2;
  const startY = (canvas.height - gridHeight) / 2;
  return { startX, startY };
}

export const OBSTACLES_MAP: Position[] = generateRandomObstacles();

function generateRandomObstacles() {
  const obstacles = new Set<Position>();
  while (obstacles.size < 10) {
    const x = Math.floor(Math.random() * COLS);
    const y = Math.floor(Math.random() * ROWS);
    obstacles.add({ x, y });
  }
  return Array.from(obstacles);
}

async function main() {
  const grid = new Grid();
  grid.draw();

  const g = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  const start = { x: 0, y: 0 };
  const end = { x: 9, y: 9 };
  OBSTACLES_MAP.forEach((obstacle) => (g[obstacle.y][obstacle.x] = 1));

  let circlePosition: Position = { x: 0, y: 0 };
  drawCircle(circlePosition);
  OBSTACLES_MAP.forEach((obstacle) => drawObstacle(obstacle));

  const navigator = new GridNavigator(g, start, end);
  const path = navigator.findPath();
  const a = navigator.convertPathToMoves(path || []);

  // for (let i = 0; i < a.length; i++) {
  //   const move = a[i];
  //   await new Promise((resolve) => setTimeout(resolve, 300));
  //   circlePosition = moveCircle(circlePosition, move);
  //   grid.draw();
  // }

  document.addEventListener("keydown", (event) => {
    const previousPosition = { ...circlePosition };
    switch (event.key) {
      case "ArrowUp":
        circlePosition = moveCircle(circlePosition, Direction.Up);
        break;
      case "ArrowDown":
        circlePosition = moveCircle(circlePosition, Direction.Down);
        break;
      case "ArrowLeft":
        circlePosition = moveCircle(circlePosition, Direction.Left);
        break;
      case "ArrowRight":
        circlePosition = moveCircle(circlePosition, Direction.Right);
        break;
    }

    clearCircle(previousPosition);
    drawCircle(circlePosition);
    grid.draw();
  });
}

main();
