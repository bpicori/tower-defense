import { Position } from "../grid";

type Grid = number[][];

export class GridNavigator {
  private grid: Grid;
  private start: Position;
  private end: Position;
  private visited: boolean[][];
  private queue: Position[];

  constructor(grid: Grid, start: Position, end: Position) {
    this.grid = grid;
    this.start = start;
    this.end = end;
    this.visited = Array.from({ length: grid.length }, () => Array(grid.length).fill(false));
    this.queue = [];
  }

  findPath(): Position[] | null {
    if (this.grid[this.start.y][this.start.x] === 1 || this.grid[this.end.y][this.end.x] === 1) {
      return null; // Start or end is blocked
    }

    let pathFound = false;
    const paths: Position[][] = [];
    this.visited[this.start.y][this.start.x] = true;
    this.queue.push(this.start);
    paths[this.start.y * this.grid.length + this.start.x] = [this.start];

    while (this.queue.length > 0) {
      const current = this.queue.shift()!;
      if (current.x === this.end.x && current.y === this.end.y) {
        pathFound = true;
        break;
      }

      const neighbors = this.getNeighbors(current);
      for (const neighbor of neighbors) {
        this.visited[neighbor.y][neighbor.x] = true;
        this.queue.push(neighbor);
        // Save the path to reach the neighbor
        paths[neighbor.y * this.grid.length + neighbor.x] = paths[current.y * this.grid.length + current.x].concat([
          neighbor,
        ]);
      }
    }

    if (pathFound) {
      return paths[this.end.y * this.grid.length + this.end.x];
    } else {
      return null;
    }
  }

  private isValidMove(point: Position): boolean {
    return (
      point.x >= 0 &&
      point.y >= 0 &&
      point.x < this.grid.length &&
      point.y < this.grid.length &&
      this.grid[point.y][point.x] === 0 &&
      !this.visited[point.y][point.x]
    );
  }

  private getNeighbors(point: Position): Position[] {
    const deltas = [
      [1, 0],
      [0, 1],
      [-1, 0],
      [0, -1],
    ];
    return deltas
      .map(([dx, dy]) => ({ x: point.x + dx, y: point.y + dy }))
      .filter((neighbor) => this.isValidMove(neighbor));
  }
}
