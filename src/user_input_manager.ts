import { EnemiesManager } from "./enemies_manager";
import { Position } from "./grid";
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

export interface UserEvents {
  click?: Position;
  obstacleDropped?: Position;
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
      if (
        newState.obstacles.some(
          (obstacle) =>
            obstacle.x === this.userEvents.obstacleDropped!.x && obstacle.y === this.userEvents.obstacleDropped!.y,
        )
      ) {
        return newState; // There is already an obstacle in this position
      }

      // check if the obstacle is not in the start or target position
      if (
        (newState.start.x === this.userEvents.obstacleDropped.x &&
          newState.start.y === this.userEvents.obstacleDropped.y) ||
        (newState.target.x === this.userEvents.obstacleDropped.x &&
          newState.target.y === this.userEvents.obstacleDropped.y)
      ) {
        return newState;
      }

      // check if out of bounds
      if (
        this.userEvents.obstacleDropped.x < 0 ||
        this.userEvents.obstacleDropped.x >= COLS ||
        this.userEvents.obstacleDropped.y < 0 ||
        this.userEvents.obstacleDropped.y >= ROWS
      ) {
        return newState;
      }

      newState.obstacles.push(this.userEvents.obstacleDropped);
      this.userEvents.obstacleDropped = undefined;
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
      userInputManager.userEvents.click = { x: cellX, y: cellY };
    });
  }

  private registerDragAndDropEvent(canvas: HTMLCanvasElement) {
    const tower = document.getElementById("tower")!;
    const obstacle = document.getElementById("obstacle")! as HTMLElement;

    tower.addEventListener("dragstart", (event) => {
      (event.target as HTMLElement).classList.add("dragging");
      // event.target.classList.add('dragging');
      event.dataTransfer!.setData("text/plain", tower.id);
    });

    tower.addEventListener("dragend", function (e) {
      (e.target as HTMLElement).classList.remove("dragging");
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

      const userInputManager = SingletonComponents[ComponentsMap.UserInputManager] as UserInputManager;
      userInputManager.userEvents.obstacleDropped = { x: cellX, y: cellY };
    });
  }
}
