import { Circle } from "./circle";
import { Grid, Position } from "./grid";
import map from "./maps/map1.json";
import { GridNavigator } from "./navigator";

export const GRID_CANVAS_ID = "gridCanvas";
export const ACTION_CANVAS_ID = "actionCanvas";
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

export const ROWS = 10;
export const COLS = 10;

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div style="position: relative;">
    <canvas id=${GRID_CANVAS_ID} width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" style="position: absolute; left: 0; top: 0; z-index: 0"></canvas>
    <canvas id=${ACTION_CANVAS_ID} width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" style="position: absolute; left: 0; top: 0; z-index: 1"></canvas>
  </div>
`;

export function getCanvasInitialPosition() {
  const canvas = document.getElementById("gridCanvas") as HTMLCanvasElement;

  const gridWidth = (CANVAS_WIDTH / COLS) * COLS;
  const gridHeight = (CANVAS_HEIGHT / ROWS) * ROWS;

  const startX = (canvas.width - gridWidth) / 2;
  const startY = (canvas.height - gridHeight) / 2;
  return { startX, startY };
}

export interface GameState {
  obstacles: Position[];
  start: Position;
  target: Position;
  enemies: {
    id: string;
    currentPosition: Position;
    path: Position[];
    targetPositionIndex: number;
    life: number;
    speed: number;
  }[];
}

export interface Component {
  render: (state: GameState) => Promise<GameState> | GameState;
}

const components: Component[] = [new Grid()];

async function gameLoop(state: GameState) {
  let gameState = { ...state };

  for (const component of components) {
    gameState = await component.render(gameState);
  }

  requestAnimationFrame(() => gameLoop(gameState));
}

async function main() {
  const { startX, startY } = getCanvasInitialPosition();
  const start = { x: 0, y: 0 };
  const target = { x: 9, y: 9 };
  const cellSize = Math.min(CANVAS_WIDTH / COLS, CANVAS_HEIGHT / ROWS);
  const obstacles = map;

  const g = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  for (const obstacle of obstacles) {
    g[obstacle.y][obstacle.x] = 1;
  }

  const navigator = new GridNavigator(g, start, target);
  const path = navigator.findPath();
  if (!path) {
    throw new Error("No path found");
  }

  const initialState: GameState = {
    obstacles,
    start,
    target,
    enemies: [
      {
        id: "enemy1",
        currentPosition: { x: startX, y: startY },
        targetPositionIndex: 0,
        path: path.map((pos) => ({
          x: startX + pos.x * cellSize + cellSize / 2,
          y: startY + pos.y * cellSize + cellSize / 2,
        })),
        life: 100,
        speed: 1,
      },
    ],
  };

  components.push(new Circle("enemy1"));

  gameLoop(initialState);
}

main();
