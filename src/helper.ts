import { GRID_CANVAS_ID, getCanvasInitialPosition } from "./main";

export const findMousePosition = (cellSize: number, event: MouseEvent) => {
  const canvas = document.getElementById(GRID_CANVAS_ID) as HTMLCanvasElement;
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // get cell position
  const { startX, startY } = getCanvasInitialPosition();
  const cellX = Math.floor((x - startX) / cellSize);
  const cellY = Math.floor((y - startY) / cellSize);

  return { x: cellX, y: cellY };
};
