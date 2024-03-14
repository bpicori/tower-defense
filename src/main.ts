import "./style.css";

import { EnemiesManager, Enemy } from "./enemies_manager";
import { Grid, Position } from "./grid";
import { PlayerLife } from "./players_life";

export const GRID_CANVAS_ID = "gridCanvas";
export const ACTION_CANVAS_ID = "actionCanvas";
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

export const ROWS = 10;
export const COLS = 10;

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div class="game-container">
    <div class="tower-panel">
      <div class="tower" draggable="true" id="tower">Tower</div>
      <div class="obstacle" draggable="true" id="obstacle">Obstacle</div>
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
  update: (state: GameState) => GameState;
  render: (state: GameState) => void;
}

enum ComponentsMap {
  Grid = "Grid",
  EnemiesManager = "EnemiesManager",
  PlayerLife = "PlayerLife",
}

const componentsMap: Record<ComponentsMap, Component> = {
  [ComponentsMap.Grid]: new Grid(),
  [ComponentsMap.EnemiesManager]: new EnemiesManager(),
  [ComponentsMap.PlayerLife]: new PlayerLife(),
};

const CELL_SIZE = Math.min(CANVAS_WIDTH / COLS, CANVAS_HEIGHT / ROWS);
const INITIAL_STATE: GameState = {
  obstacles: [],
  start: { x: 0, y: 0 },
  target: { x: 9, y: 9 },
  canvasStartPosition: getCanvasInitialPosition(),
  cellSize: CELL_SIZE,
  playerLife: 100,
  enemies: [
    {
      id: "1",
      speed: 1,
      targetPositionIndex: 0,
      status: "alive",
    },
  ],
};

function processUserInput(state: GameState, userEvents: UserEvents): GameState {
  let newState = { ...state }; // Create a copy of the current state

  if (userEvents.click) {
    const enemyManager = componentsMap[ComponentsMap.EnemiesManager] as EnemiesManager;
    newState = enemyManager.addEnemy(newState, userEvents.click);
    userEvents.click = undefined;
  }

  if (userEvents.obstacleDropped) {
    newState.obstacles.push(userEvents.obstacleDropped);
    userEvents.obstacleDropped = undefined;
  }

  return newState;
}

async function gameLoop(state: GameState) {
  state = processUserInput(state, userInput);

  for (const component of Object.values(componentsMap)) {
    state = component.update(state);
  }

  // clear canvas
  const canvas = document.getElementById(ACTION_CANVAS_ID) as HTMLCanvasElement;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const component of Object.values(componentsMap)) {
    component.render(state);
  }

  requestAnimationFrame(() => gameLoop(state));
}

interface UserEvents {
  click?: Position;
  obstacleDropped?: Position;
}

const userInput: UserEvents = {
  click: undefined,
  obstacleDropped: undefined,
};

async function main() {
  document.addEventListener("click", (event) => {
    const canvas = document.getElementById(ACTION_CANVAS_ID) as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();

    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    ) {
      return; // Click was outside, exit the function.
    }

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // get cell position
    const { x: startX, y: startY } = getCanvasInitialPosition();
    const cellX = Math.floor((x - startX) / CELL_SIZE);
    const cellY = Math.floor((y - startY) / CELL_SIZE);

    userInput.click = { x: cellX, y: cellY };
  });

  // Towers drag and drop logic
  const tower = document.getElementById("tower")!;
  const obstacle = document.getElementById("obstacle")!;
  const canvas = document.getElementById(ACTION_CANVAS_ID)!;

  tower.addEventListener("dragstart", (event) => {
    event.dataTransfer!.setData("text/plain", tower.id);
  });

  obstacle.addEventListener("dragstart", (event) => {
    event.dataTransfer!.setData("text/plain", obstacle.id);
  });

  canvas.addEventListener("dragover", (event) => {
    event.preventDefault(); // Necessary to allow dropping
  });

  canvas.addEventListener("drop", (event) => {
    event.preventDefault();

    const x = event.clientX - canvas.offsetLeft;
    const y = event.clientY - canvas.offsetTop;

    // calculate cell position
    const { x: startX, y: startY } = getCanvasInitialPosition();
    const cellX = Math.floor((x - startX) / CELL_SIZE);
    const cellY = Math.floor((y - startY) / CELL_SIZE);

    userInput.obstacleDropped = { x: cellX, y: cellY };
  });

  gameLoop(INITIAL_STATE);
}

main();
