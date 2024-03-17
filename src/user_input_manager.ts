import { EnemiesManager } from "./enemies_manager";
import { Position } from "./grid";
import { COLS, Component, ComponentsMap, GameState, ROWS, SingletonComponents } from "./main";

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
}
