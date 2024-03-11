import { Circle } from "./circle";
import { Grid, Position } from "./grid";
import { generateRandomObstacles } from "./helper";

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
  entry: Position;
  exit: Position;
}

export interface Component {
  init?: (state: GameState) => void;
  updateState: (state: GameState) => GameState;
  render: (state: GameState) => Promise<void> | void;
}

const components: Component[] = [new Grid(), new Circle()];

function updateGameState(previousState: GameState) {
  let state = { ...previousState };
  for (const component of components) {
    state = component.updateState(state);
  }

  return state;
}

function renderGame(state: GameState): void {
  for (const component of components) {
    component.render(state);
  }
}

async function gameLoop(state: GameState) {
  const gameState = updateGameState(state);

  renderGame(gameState);

  requestAnimationFrame(() => gameLoop(gameState));
}

async function main() {
  const initialState: GameState = {
    obstacles: generateRandomObstacles(),
    entry: { x: 0, y: 0 },
    exit: { x: 9, y: 9 },
  };

  for (const component of components) {
    if (component.init) {
      component.init(initialState);
    }
  }

  gameLoop(initialState);
}

main();
