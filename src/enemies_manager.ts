import { ACTION_CANVAS_ID, CELL_SIZE, COLS, Component, GameState, ROWS } from "./main";
import { GridPosition, Vector, gridPositionToVector, vectorToGridPosition } from "./utils/helper";
import { GridNavigator } from "./utils/navigator";
import sprite from "./sprite.svg";
import { SpriteMap } from "./grid";

export interface Enemy {
  id: string;
  currentPosition: Vector;
  speed: number;
  status: "alive" | "dead" | "escaped";
  life: number;
  direction?: Vector;
}

export class EnemiesManager implements Component {
  image: HTMLImageElement;
  constructor() {
    this.image = new Image();
    this.image.src = sprite;
  }

  addEnemy(state: GameState, position: GridPosition): GameState {
    const { enemies } = state;

    const currentPosition = gridPositionToVector(position);

    const newEnemy: Enemy = {
      id: String(Date.now()),
      speed: 0.5,
      currentPosition,
      status: "alive",
      life: 100,
    };

    return { ...state, enemies: [...enemies, newEnemy] };
  }

  render(state: GameState) {
    for (const enemy of state.enemies) {
      this.renderEnemy(enemy);
    }
  }

  update(state: GameState): GameState {
    const { enemies } = state;
    const aliveEnemies = enemies.filter((enemy) => enemy.status === "alive");
    const updatedEnemies: Enemy[] = [];
    let { playerLife } = state;

    for (const enemy of aliveEnemies) {
      const newEnemy = this.updateEnemy(enemy, state);

      if (newEnemy.status === "escaped") {
        playerLife -= 1;
      }

      updatedEnemies.push(newEnemy);
    }

    return { ...state, playerLife, enemies: updatedEnemies };
  }

  private updateEnemy(enemy: Enemy, state: GameState): Enemy {
    // eslint-disable-next-line prefer-const
    let { currentPosition, speed, status } = enemy;
    const { target, obstacles } = state;

    if (enemy.life <= 0) {
      status = "dead";
      return {
        ...enemy,
        status,
      };
    }

    const currentPositionInGrid = vectorToGridPosition(currentPosition);

    const nextPosition = this.findNextPosition(currentPositionInGrid, target, obstacles);

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

    const newPosition = this.calculateNewPosition(nextPosition, currentPosition, speed);
    const newDirection = this.findDirection(currentPosition, newPosition);

    return {
      ...enemy,
      currentPosition: newPosition,
      direction: newDirection,
      status,
    };
  }

  private findNextPosition(
    currentPosition: GridPosition,
    targetPosition: GridPosition,
    obstacles: GridPosition[],
  ): GridPosition | null {
    const g = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    for (const obstacle of obstacles) {
      g[obstacle.col][obstacle.row] = 1;
    }

    const path = new GridNavigator(g, currentPosition, targetPosition).findPath();
    if (!path) {
      return null;
    }

    return path[1];
  }

  private renderEnemy(enemy: Enemy) {
    const { currentPosition } = enemy;

    const canvas = document.getElementById(ACTION_CANVAS_ID) as HTMLCanvasElement;
    const ctx = canvas.getContext("2d")!;

    const { x, y, width, height } = SpriteMap.SOLDIER;

    ctx.drawImage(
      this.image,
      x,
      y,
      width,
      height,
      currentPosition.x - CELL_SIZE / 2,
      currentPosition.y - CELL_SIZE / 2,
      CELL_SIZE,
      CELL_SIZE,
    );
  }

  private calculateNewPosition(nextPosition: GridPosition, currentPosition: Vector, speed: number): Vector {
    const deltaX = nextPosition.row * CELL_SIZE + CELL_SIZE / 2 - currentPosition.x;
    const deltaY = nextPosition.col * CELL_SIZE + CELL_SIZE / 2 - currentPosition.y;
    const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

    const stepSize = Math.min(speed, distance);
    const stepRatio = stepSize / distance;

    const newPosition = {
      x: currentPosition.x + deltaX * stepRatio,
      y: currentPosition.y + deltaY * stepRatio,
    };

    return newPosition;
  }

  private findDirection(currentPosition: Vector, nextPosition: Vector): Vector {
    const deltaX = nextPosition.x - currentPosition.x;
    const deltaY = nextPosition.y - currentPosition.y;

    const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

    return {
      x: deltaX / distance,
      y: deltaY / distance,
    };
  }
}
