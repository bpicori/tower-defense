import { Position } from "./grid";
import { ACTION_CANVAS_ID, COLS, Component, GameState, ROWS } from "./main";
import { GridNavigator } from "./utils/navigator";

export interface Enemy {
  id: string;
  currentPosition: Position;
  speed: number;
  status: "alive" | "dead" | "escaped";
}

export class EnemiesManager implements Component {
  addEnemy(state: GameState, position: Position): GameState {
    const { enemies } = state;

    const currentPosition = {
      x: position.x * state.cellSize + state.cellSize / 2,
      y: position.y * state.cellSize + state.cellSize / 2,
    };

    const newEnemy: Enemy = {
      id: String(Date.now()),
      speed: 1,
      currentPosition,
      status: "alive",
    };

    return { ...state, enemies: [...enemies, newEnemy] };
  }

  render(state: GameState) {
    for (const enemy of state.enemies) {
      this.renderEnemy(enemy, state);
    }
  }

  update(state: GameState): GameState {
    const { enemies } = state;
    const aliveEnemies = enemies.filter((enemy) => enemy.status === "alive");
    const updatedEnemies: Enemy[] = [];
    let { playerLife } = state;

    for (const enemy of aliveEnemies) {
      const newEnemy = this.updateEnemy(enemy, state);

      if (enemy.status !== "escaped" && newEnemy.status === "escaped") {
        playerLife -= 1;
      }

      updatedEnemies.push(newEnemy);
    }

    return { ...state, playerLife, enemies: updatedEnemies };
  }

  private updateEnemy(enemy: Enemy, state: GameState): Enemy {
    // eslint-disable-next-line prefer-const
    let { currentPosition, speed, status } = enemy;
    const { target, obstacles, cellSize } = state;

    const findPositionInGrid = {
      x: Math.floor(currentPosition.x / cellSize),
      y: Math.floor(currentPosition.y / cellSize),
    };

    const nextPosition = this.findNextPosition(findPositionInGrid, target, obstacles);

    if (!nextPosition) {
      status = "escaped";
      return {
        ...enemy,
        status,
      };
    }

    if (status !== "alive") {
      return enemy;
    }

    const newPosition = this.calculateNewPosition(nextPosition, currentPosition, cellSize, speed);

    return {
      ...enemy,
      currentPosition: newPosition,
      status,
    };
  }

  private findNextPosition(
    currentPosition: Position,
    targetPosition: Position,
    obstacles: Position[],
  ): Position | null {
    const g = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    for (const obstacle of obstacles) {
      g[obstacle.y][obstacle.x] = 1;
    }

    const path = new GridNavigator(g, currentPosition, targetPosition).findPath();
    if (!path) {
      return null;
    }

    return path[1];
  }

  private renderEnemy(enemy: Enemy, state: GameState) {
    const { currentPosition } = enemy;
    if (!currentPosition) return;

    const { cellSize } = state;
    const radius: number = cellSize / 4;
    const canvas = document.getElementById(ACTION_CANVAS_ID) as HTMLCanvasElement;
    const ctx = canvas.getContext("2d")!;

    ctx.beginPath();
    ctx.arc(currentPosition.x, currentPosition.y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.stroke();
  }

  calculateNewPosition(nextPosition: Position, currentPosition: Position, cellSize: number, speed: number): Position {
    const deltaX = nextPosition.x * cellSize + cellSize / 2 - currentPosition.x;
    const deltaY = nextPosition.y * cellSize + cellSize / 2 - currentPosition.y;
    const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

    const stepSize = Math.min(speed, distance);
    const stepRatio = stepSize / distance;

    const newPosition = {
      x: currentPosition.x + deltaX * stepRatio,
      y: currentPosition.y + deltaY * stepRatio,
    };

    return newPosition;
  }
}
