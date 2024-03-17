import { EnemiesManager } from "./enemies_manager";
import {
  ACTION_CANVAS_ID,
  CELL_SIZE,
  COLS,
  Component,
  ComponentsMap,
  GameState,
  ROWS,
  SingletonComponents,
  getCanvasInitialPosition,
} from "./main";
import { GridPosition, equalGridPositions, vectorToGridPosition } from "./utils/helper";

export interface UserEvents {
  click?: GridPosition;
  towerDropped?: GridPosition;
  obstacleDropped?: GridPosition;
}

export class UserInputManager implements Component {
  public userEvents: UserEvents;
  constructor() {
    this.userEvents = {
      click: undefined,
      obstacleDropped: undefined,
    };
    this.registerEventListeners();
  }

  update(state: GameState): GameState {
    let newState = { ...state }; // Create a copy of the current state

    if (this.userEvents.click) {
      const enemyManager = SingletonComponents[ComponentsMap.EnemiesManager] as EnemiesManager;
      newState = enemyManager.addEnemy(newState, this.userEvents.click);
      this.userEvents.click = undefined;
    }

    if (this.userEvents.obstacleDropped) {
      const obstaclePosition = this.userEvents.obstacleDropped;
      const { start, target } = newState;

      if (newState.obstacles.some((obstacle) => equalGridPositions(obstacle, obstaclePosition))) {
        return newState; // There is already an obstacle in this position
      }

      // check if the obstacle is not in the start or target position
      if (equalGridPositions(start, obstaclePosition) || equalGridPositions(target, obstaclePosition)) {
        return newState;
      }

      // check if out of bounds
      if (this.isOutOfBounds(this.userEvents.obstacleDropped)) {
        return newState;
      }

      newState.obstacles.push(this.userEvents.obstacleDropped);
      this.userEvents.obstacleDropped = undefined;
    }

    if (this.userEvents.towerDropped) {
      const towerPosition = this.userEvents.towerDropped;

      if (this.isOutOfBounds(towerPosition)) {
        return newState;
      }

      if (newState.towers.some((tower) => equalGridPositions(tower.currentPosition, towerPosition))) {
        return newState; // There is already a tower in this position
      }

      // the tower should be dropped in an obstacle
      if (!newState.obstacles.some((obstacle) => equalGridPositions(obstacle, towerPosition))) {
        return newState;
      }

      // delete the obstacle
      state.obstacles = state.obstacles.filter((obstacle) => !equalGridPositions(obstacle, towerPosition));

      newState.towers.push({
        id: String(Date.now()),
        currentPosition: towerPosition,
        range: 1,
        damage: 10,
        sleep: 0,
        lastTimeFired: 0,
      });

      this.userEvents.towerDropped = undefined;
    }

    return newState;
  }

  render() {
    return;
  }

  private registerEventListeners() {
    const canvas = document.getElementById(ACTION_CANVAS_ID) as HTMLCanvasElement;

    this.registerCanvasClickEvent(canvas);
    this.registerDragAndDropEvent(canvas);
  }

  private registerCanvasClickEvent(canvas: HTMLCanvasElement) {
    canvas.addEventListener("click", (event) => {
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

      const userInputManager = SingletonComponents[ComponentsMap.UserInputManager] as UserInputManager;
      userInputManager.userEvents.click = { row: cellX, col: cellY };
    });
  }

  private registerDragAndDropEvent(canvas: HTMLCanvasElement) {
    const tower = document.getElementById("tower")!;
    const obstacle = document.getElementById("obstacle")! as HTMLElement;

    tower.addEventListener("dragstart", (event) => {
      (event.target as HTMLElement).classList.add("dragging");
      const data = {
        type: "tower",
      };
      event.dataTransfer!.setData("text/plain", JSON.stringify(data));
    });

    tower.addEventListener("dragend", function (e) {
      (e.target as HTMLElement).classList.remove("dragging");
    });

    obstacle.addEventListener("dragstart", (event) => {
      event.dataTransfer!.setData("text/plain", JSON.stringify({ type: "obstacle" }));
    });

    canvas.addEventListener("dragover", (event) => {
      event.preventDefault(); // Necessary to allow dropping
    });

    canvas.addEventListener("drop", (event) => {
      event.preventDefault();
      const rawData = event.dataTransfer!.getData("text/plain");

      if (!rawData) return;

      const data = JSON.parse(rawData) as { type: string };

      const x = event.clientX - canvas.offsetLeft;
      const y = event.clientY - canvas.offsetTop;

      const gridPosition = vectorToGridPosition({ x, y });
      const userInputManager = SingletonComponents[ComponentsMap.UserInputManager] as UserInputManager;

      if (data.type === "tower") {
        userInputManager.userEvents.towerDropped = { row: gridPosition.row, col: gridPosition.col };
      }

      if (data.type === "obstacle") {
        userInputManager.userEvents.obstacleDropped = { row: gridPosition.row, col: gridPosition.col };
      }
    });
  }

  private isOutOfBounds(position: GridPosition): boolean {
    return position.row < 0 || position.row >= COLS || position.col < 0 || position.col >= ROWS;
  }
}
