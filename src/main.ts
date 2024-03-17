import "./style.css";

import { EnemiesManager, Enemy } from "./enemies_manager";
import { Grid, Position } from "./grid";
import { PlayerLife } from "./players_life";
import { UserInputManager } from "./user_input_manager";
import map from "./maps/map1.json";

export const GRID_CANVAS_ID = "gridCanvas";
export const ACTION_CANVAS_ID = "actionCanvas";
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

export const ROWS = 10;
export const COLS = 10;

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div class="game-container">
    <div class="tower-panel">
        <div class="tower" draggable="true" id="tower">
          <div class="range"></div>
        </div>
        <div class="obstacle" draggable="true" id="obstacle"></div>
    </div>
    <div class="canvas-container">
      <div class="player-life">
        Player life: <span id="playerLife"></span>
      </div>
      <canvas id="${ACTION_CANVAS_ID}" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}"></canvas>
    </div>
  </div>
`;

export function getCanvasInitialPosition(): Position {
  const canvas = document.getElementById(ACTION_CANVAS_ID) as HTMLCanvasElement;

  const gridWidth = (CANVAS_WIDTH / COLS) * COLS;
  const gridHeight = (CANVAS_HEIGHT / ROWS) * ROWS;

  const startX = (canvas.width - gridWidth) / 2;
  const startY = (canvas.height - gridHeight) / 2;
  return { x: startX, y: startY };
}

export interface GameState {
  obstacles: Position[];
  start: Position;
  target: Position;
  canvasStartPosition: Position;
  cellSize: number;
  playerLife: number;
  enemies: Enemy[];
}

export interface Component {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update: (state: GameState) => GameState;
  render: (state: GameState) => void;
}

export enum ComponentsMap {
  Grid = "Grid",
  EnemiesManager = "EnemiesManager",
  PlayerLife = "PlayerLife",
  UserInputManager = "UserInputManager",
}

export const SingletonComponents: Record<ComponentsMap, Component> = {
  [ComponentsMap.Grid]: new Grid(),
  [ComponentsMap.EnemiesManager]: new EnemiesManager(),
  [ComponentsMap.PlayerLife]: new PlayerLife(),
  [ComponentsMap.UserInputManager]: new UserInputManager(),
};

export const CELL_SIZE = Math.min(CANVAS_WIDTH / COLS, CANVAS_HEIGHT / ROWS);

const INITIAL_STATE: GameState = {
  obstacles: map,
  start: { x: 0, y: 0 },
  target: { x: 9, y: 9 },
  canvasStartPosition: getCanvasInitialPosition(),
  cellSize: CELL_SIZE,
  playerLife: 100,
  enemies: [
    {
      id: "1",
      currentPosition: getCanvasInitialPosition(),
      speed: 1,
      status: "alive",
    },
  ],
};

async function gameLoop(state: GameState) {
  // state = processUserInput(state, userInput);

  for (const component of Object.values(SingletonComponents)) {
    state = component.update(state);
  }

  clearCanvas();

  for (const component of Object.values(SingletonComponents)) {
    component.render(state);
  }

  requestAnimationFrame(() => gameLoop(state));
}

function clearCanvas() {
  const canvas = document.getElementById(ACTION_CANVAS_ID) as HTMLCanvasElement;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

async function main() {
  gameLoop(INITIAL_STATE);
}

main();
