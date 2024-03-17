import { GridPosition } from "./helper";

type Grid = number[][];

export class GridNavigator {
  private grid: Grid;
  private start: GridPosition;
  private end: GridPosition;
  private visited: boolean[][];
  private queue: GridPosition[];

  constructor(grid: Grid, start: GridPosition, end: GridPosition) {
    this.grid = grid;
    this.start = start;
    this.end = end;
    this.visited = Array.from({ length: grid.length }, () => Array(grid.length).fill(false));
    this.queue = [];
  }

  findPath(): GridPosition[] | null {
    if (this.grid[this.start.col][this.start.row] === 1 || this.grid[this.end.col][this.end.row] === 1) {
      return null; // Start or end is blocked
    }

    let pathFound = false;
    const paths: GridPosition[][] = [];
    this.visited[this.start.col][this.start.row] = true;
    this.queue.push(this.start);
    paths[this.start.col * this.grid.length + this.start.row] = [this.start];

    while (this.queue.length > 0) {
      const current = this.queue.shift()!;
      if (current.row === this.end.row && current.col === this.end.col) {
        pathFound = true;
        break;
      }

      const neighbors = this.getNeighbors(current);
      for (const neighbor of neighbors) {
        this.visited[neighbor.col][neighbor.row] = true;
        this.queue.push(neighbor);
        // Save the path to reach the neighbor
        paths[neighbor.col * this.grid.length + neighbor.row] = paths[
          current.col * this.grid.length + current.row
        ].concat([neighbor]);
      }
    }

    if (pathFound) {
      return paths[this.end.col * this.grid.length + this.end.row];
    } else {
      return null;
    }
  }

  private isValidMove(point: GridPosition): boolean {
    return (
      point.row >= 0 &&
      point.col >= 0 &&
      point.row < this.grid.length &&
      point.col < this.grid.length &&
      this.grid[point.col][point.row] === 0 &&
      !this.visited[point.col][point.row]
    );
  }

  private getNeighbors(point: GridPosition): GridPosition[] {
    const deltas = [
      [1, 0],
      [0, 1],
      [-1, 0],
      [0, -1],
    ];
    return deltas
      .map(([dx, dy]) => ({ row: point.row + dx, col: point.col + dy }))
      .filter((neighbor) => this.isValidMove(neighbor));
  }
}
