import { Position } from "./grid";
import { ACTION_CANVAS_ID, COLS, Component, GameState, ROWS } from "./main";
import { GridNavigator } from "./navigator";

export interface Enemy {
  id: string;
  currentPosition?: Position;
  path?: Position[];
  speed: number;
  targetPositionIndex: number;
  status: "alive" | "dead" | "escaped";
}

export class EnemiesManager implements Component {
  constructor() {}
  addEnemy(state: GameState, position: Position): GameState {
    const { enemies } = state;

    const path = this.findPath(state.obstacles, position, state.target, state.cellSize);
    const currentPosition = {
      x: position.x * state.cellSize + state.cellSize / 2,
      y: position.y * state.cellSize + state.cellSize / 2,
    };

    const newEnemy: Enemy = {
      id: String(Date.now()),
      speed: 1,
      currentPosition,
      targetPositionIndex: 0,
      status: "alive",
      path,
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
    let { currentPosition, path, speed, targetPositionIndex, status } = enemy;
    const { start, target, obstacles, canvasStartPosition, cellSize } = state;

    if (!path) {
      path = this.findPath(obstacles, start, target, cellSize);
    }

    if (!currentPosition) {
      currentPosition = { ...canvasStartPosition };
    }

    if (status !== "alive") {
      return enemy;
    }

    const targetPosition = path[targetPositionIndex];

    const deltaX = targetPosition.x - currentPosition.x;
    const deltaY = targetPosition.y - currentPosition.y;
    const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

    if (distance === 0) {
      targetPositionIndex += 1;

      if (targetPositionIndex >= path.length) {
        status = "escaped";
      }
      return {
        ...enemy,
        currentPosition,
        path,
        targetPositionIndex,
        status,
      };
    }

    const stepSize = Math.min(speed, distance);
    const stepRatio = stepSize / distance;

    const newPosition = {
      x: currentPosition.x + deltaX * stepRatio,
      y: currentPosition.y + deltaY * stepRatio,
    };

    return {
      ...enemy,
      currentPosition: newPosition,
      path,
      targetPositionIndex,
      status,
    };
  }

  private findPath(obstacles: Position[], start: Position, target: Position, cellSize: number): Position[] {
    const g = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    for (const obstacle of obstacles) {
      g[obstacle.y][obstacle.x] = 1;
    }
    const navigator = new GridNavigator(g, start, target);
    const path = navigator.findPath();
    if (!path) {
      throw new Error("No path found");
    }

    return path.map((point) => ({
      x: point.x * cellSize + cellSize / 2,
      y: point.y * cellSize + cellSize / 2,
    }));
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
}
