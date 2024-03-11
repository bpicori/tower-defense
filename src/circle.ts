import { Position } from "./grid";
import {
  ACTION_CANVAS_ID,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  COLS,
  Component,
  GameState,
  ROWS,
  getCanvasInitialPosition,
} from "./main";
import { GridNavigator } from "./navigator";

export enum Direction {
  Up = "Up",
  Down = "Down",
  Left = "Left",
  Right = "Right",
}

export class Circle implements Component {
  private previousPosition: Position | null = null;
  private position: Position | null = null;
  private path: Position[] | null = null;
  private pixelsPath: Position[] | null = null;

  init(state: GameState): void {
    const { entry, exit, obstacles } = state;
    const g = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

    for (const obstacle of obstacles) {
      g[obstacle.y][obstacle.x] = 1;
    }

    const navigator = new GridNavigator(g, entry, exit);
    this.path = navigator.findPath();
    this.pixelsPath = this.pathToPixels(this.path!);
    console.log(this.pixelsPath);
  }

  updateState(state: GameState) {
    if (this.position === null) {
      this.position = state.entry;
    }

    if (!this.path) return state;

    if (this.path.length === 0) return state;

    this.previousPosition = this.position;
    this.position = this.path.shift()!;

    return state;
  }

  render() {
    if (!this.position) return;
    if (!this.previousPosition) return;

    if (!this.isPositionChanged(this.previousPosition, this.position)) return;

    this.clearCircle(this.previousPosition);
    this.drawCircle(this.position);
    this.previousPosition = this.position;
  }

  private isPositionChanged(previousPosition: Position | null, newPosition: Position | null) {
    if (!previousPosition || !newPosition) return true;

    return previousPosition.x !== newPosition.x || previousPosition.y !== newPosition.y;
  }

  private async drawCircle(position: Position) {
    const canvas = document.getElementById(ACTION_CANVAS_ID) as HTMLCanvasElement;
    const ctx = canvas.getContext("2d")!;

    const cellSize = Math.min(CANVAS_WIDTH / COLS, CANVAS_HEIGHT / ROWS);

    const { startX, startY } = getCanvasInitialPosition();

    ctx.beginPath();
    ctx.arc(
      startX + position.x * cellSize + cellSize / 2,
      startY + position.y * cellSize + cellSize / 2,
      cellSize / 4,
      0,
      2 * Math.PI,
    );
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.stroke();
  }

  private clearCircle(position: Position) {
    const canvas = document.getElementById(ACTION_CANVAS_ID) as HTMLCanvasElement;
    const ctx = canvas.getContext("2d")!;

    const { startX, startY } = getCanvasInitialPosition();
    const cellSize = Math.min(CANVAS_WIDTH / COLS, CANVAS_HEIGHT / ROWS);

    // clear previous circle
    ctx.clearRect(startX + position.x * cellSize, startY + position.y * cellSize, cellSize, cellSize);
  }

  private pathToPixels(path: Position[]): Position[] {
    const cellSize = Math.min(CANVAS_WIDTH / COLS, CANVAS_HEIGHT / ROWS);
    const { startX, startY } = getCanvasInitialPosition();

    return path.map((pos) => ({
      x: startX + pos.x * cellSize + cellSize / 2,
      y: startY + pos.y * cellSize + cellSize / 2,
    }));
  }
}

// export function drawCircle(position: Position) {
//   const canvas = document.getElementById(ACTION_CANVAS_ID) as HTMLCanvasElement;
//   const ctx = canvas.getContext("2d")!;

//   const cellSize = Math.min(CANVAS_WIDTH / COLS, CANVAS_HEIGHT / ROWS);

//   const { startX, startY } = getCanvasInitialPosition();

//   ctx.beginPath();
//   ctx.arc(
//     startX + position.x * cellSize + cellSize / 2,
//     startY + position.y * cellSize + cellSize / 2,
//     cellSize / 4,
//     0,
//     2 * Math.PI,
//   );
//   ctx.fillStyle = "red";
//   ctx.fill();
//   ctx.stroke();
// }

// export function clearCircle(position: Position) {
//   const canvas = document.getElementById(ACTION_CANVAS_ID) as HTMLCanvasElement;
//   const ctx = canvas.getContext("2d")!;

//   const { startX, startY } = getCanvasInitialPosition();
//   const cellSize = Math.min(CANVAS_WIDTH / COLS, CANVAS_HEIGHT / ROWS);

//   ctx.clearRect(0, 0, canvas.width, canvas.height);
// }

// export function moveCircle(position: Position, direction: Direction) {
//   let { x, y } = position;
//   const previousPosition = { ...position };
//   switch (direction) {
//     case Direction.Up:
//       y = Math.max(0, position.y - 1);
//       break;
//     case Direction.Down:
//       y = Math.min(ROWS - 1, position.y + 1);
//       break;
//     case Direction.Left:
//       x = Math.max(0, position.x - 1);
//       break;
//     case Direction.Right:
//       x = Math.min(COLS - 1, position.x + 1);
//       break;
//   }

//   // check if new position has an obstacle
//   if (OBSTACLES_MAP.some((obstacle) => obstacle.x === x && obstacle.y === y)) {
//     return previousPosition;
//   }

//   animateMovement(previousPosition, { x, y });

//   return { x, y };
// }

// function animateMovement(fromPosition: Position, toPosition: Position) {
//   const frames = 100; // Number of frames for the animation
//   const frameDuration = 10; // Duration of each frame in ms

//   for (let frame = 0; frame <= frames; frame++) {
//     setTimeout(() => {
//       const x = fromPosition.x + ((toPosition.x - fromPosition.x) * frame) / frames;
//       const y = fromPosition.y + ((toPosition.y - fromPosition.y) * frame) / frames;

//       clearCircle(fromPosition);
//       drawCircle({ x, y });
//     }, frame * frameDuration);
//   }
// }
