import { CELL_SIZE, GRID_CANVAS_ID, getCanvasInitialPosition } from "../main";

export interface GridPosition {
  row: number;
  col: number;
}

export interface Vector {
  x: number;
  y: number;
}

export const findMousePosition = (cellSize: number, event: MouseEvent) => {
  const canvas = document.getElementById(GRID_CANVAS_ID) as HTMLCanvasElement;
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // get cell position
  const { x: startX, y: startY } = getCanvasInitialPosition();
  const cellX = Math.floor((x - startX) / cellSize);
  const cellY = Math.floor((y - startY) / cellSize);

  console.log(cellX, cellY);
  return { x: cellX, y: cellY };
};

export const vectorToGridPosition = (vector: Vector): GridPosition => {
  const { x: startX, y: startY } = getCanvasInitialPosition();
  const { x, y } = vector;

  return {
    row: Math.floor((x - startX) / CELL_SIZE),
    col: Math.floor((y - startY) / CELL_SIZE),
  };
};

export const gridPositionToVector = (gridPosition: GridPosition): Vector => {
  const { x: startX, y: startY } = getCanvasInitialPosition();
  const { row, col } = gridPosition;

  return {
    x: startX + row * CELL_SIZE,
    y: startY + col * CELL_SIZE,
  };
};

export const equalGridPositions = (a: GridPosition, b: GridPosition) => {
  return a.row === b.row && a.col === b.col;
};
