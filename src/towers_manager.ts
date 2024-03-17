import { ACTION_CANVAS_ID, CELL_SIZE, Component, GameState, getCanvasInitialPosition } from "./main";
import { GridPosition } from "./utils/helper";

export interface Tower {
  id: string;
  currentPosition: GridPosition;
  range: number;
  damage: number;
}

export class TowersManager implements Component {
  update(state: GameState) {
    return state;
  }
  render(state: GameState) {
    const { towers } = state;

    const canvas = document.getElementById(ACTION_CANVAS_ID) as HTMLCanvasElement;
    const ctx = canvas.getContext("2d")!;
    const { x: startX, y: startY } = getCanvasInitialPosition();

    for (const tower of towers) {
      ctx.beginPath();
      ctx.rect(
        startX + tower.currentPosition.row * CELL_SIZE,
        startY + tower.currentPosition.col * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE,
      );
      ctx.fillStyle = "green";
      ctx.fill();
      ctx.stroke();
    }
  }
}
