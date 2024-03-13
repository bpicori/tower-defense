import { Position } from "./grid";
import { ACTION_CANVAS_ID, CANVAS_HEIGHT, CANVAS_WIDTH, COLS, Component, GameState, ROWS } from "./main";

export class Circle implements Component {
  private cellSize: number = Math.min(CANVAS_WIDTH / COLS, CANVAS_HEIGHT / ROWS);
  private radius: number = this.cellSize / 4;
  id: string;

  constructor(id: string) {
    this.id = id;
  }

  render(state: GameState) {
    const { enemies } = state;
    // find the enemy with the same id as this circle and remove it from the state
    const enemy = enemies.find((enemy) => enemy.id === this.id);
    if (!enemy) return state;

    const { currentPosition, path, speed, targetPositionIndex } = enemy;

    if (targetPositionIndex < path.length) {
      const targetPosition = path[targetPositionIndex];

      const deltaX = targetPosition.x - currentPosition.x;
      const deltaY = targetPosition.y - currentPosition.y;
      const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

      if (distance === 0) {
        const nextTargetPositionIndex = targetPositionIndex + 1;

        if (nextTargetPositionIndex >= path.length) {
          return this.newState(state, nextTargetPositionIndex, currentPosition);
        }

        return this.newState(state, nextTargetPositionIndex, currentPosition);
      }

      const stepSize = Math.min(speed, distance);
      const stepRatio = stepSize / distance;

      this.clearCircle(currentPosition);

      currentPosition.x += deltaX * stepRatio;
      currentPosition.y += deltaY * stepRatio;

      this.drawCircle(currentPosition);

      return this.newState(state, targetPositionIndex, currentPosition);
    }

    return state;
  }

  private async drawCircle(position: Position) {
    const canvas = document.getElementById(ACTION_CANVAS_ID) as HTMLCanvasElement;
    const ctx = canvas.getContext("2d")!;

    ctx.beginPath();
    ctx.arc(position.x, position.y, this.radius, 0, 2 * Math.PI);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.stroke();
  }

  private clearCircle(position: Position) {
    const canvas = document.getElementById(ACTION_CANVAS_ID) as HTMLCanvasElement;
    const ctx = canvas.getContext("2d")!;

    const clearancePadding = 1;
    const clearanceAreaSize = this.radius * 2 + clearancePadding * 2;
    const clearanceStartX = position.x - this.radius - clearancePadding;
    const clearanceStartY = position.y - this.radius - clearancePadding;

    ctx.clearRect(clearanceStartX, clearanceStartY, clearanceAreaSize, clearanceAreaSize);
  }

  private newState(state: GameState, targetPositionIndex: number, currentPosition: Position) {
    return {
      ...state,
      enemies: state.enemies.map((enemy) => {
        if (enemy.id === this.id) {
          return {
            ...enemy,
            targetPositionIndex,
            currentPosition,
          };
        }
        return enemy;
      }),
    };
  }
}
