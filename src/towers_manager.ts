import { ACTION_CANVAS_ID, CELL_SIZE, Component, GameState, getCanvasInitialPosition } from "./main";
import { GridPosition, Vector, gridPositionToVector } from "./utils/helper";

export interface Tower {
  id: string;
  currentPosition: GridPosition;
  range: number;
  damage: number;
  bullet?: {
    bulletSpeed: number;
    bulletPosition: Vector;
    bulletTarget: Vector;
    enemyId?: string;
  };
  isFiring: boolean;
  sleep: number;
}

export class TowersManager implements Component {
  update(state: GameState) {
    const { towers } = state;
    const newTowers: Tower[] = [];

    for (const tower of towers) {
      const newTower = this.updateTower(tower, state);

      newTowers.push(newTower);
    }

    return { ...state, towers: newTowers };
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

      // draw bullet
      if (tower.bullet) {
        const { bulletPosition } = tower.bullet;
        ctx.beginPath();
        ctx.arc(startX + bulletPosition.x, startY + bulletPosition.y, 5, 0, Math.PI * 2, false);
        ctx.fillStyle = "black";
        ctx.fill();
        ctx.stroke();
      }
    }
  }

  private updateTower(tower: Tower, state: GameState): Tower {
    const { enemies } = state;
    const { currentPosition: towerPosition, bullet } = tower;

    if (bullet) {
      const { bulletPosition, bulletSpeed, enemyId } = bullet;
      const enemy = enemies.find((enemy) => enemy.id === enemyId);
      if (!enemy) {
        tower.bullet = undefined;
        return tower;
      }

      const { currentPosition: enemyPosition } = enemy;
      const dx = enemyPosition.x - bulletPosition.x;
      const dy = enemyPosition.y - bulletPosition.y;

      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 5) {
        tower.bullet = undefined;
      } else {
        const bulletX = bulletPosition.x + (dx / distance) * bulletSpeed;
        const bulletY = bulletPosition.y + (dy / distance) * bulletSpeed;

        tower.bullet = {
          bulletPosition: { x: bulletX, y: bulletY },
          bulletTarget: enemyPosition,
          bulletSpeed,
          enemyId,
        };
      }
    } else {
      const enemyInRange = enemies[0];

      if (enemyInRange) {
        const { currentPosition: enemyPosition } = enemyInRange;

        const bulletPosition = gridPositionToVector(towerPosition);

        tower.bullet = {
          bulletPosition,
          bulletTarget: enemyPosition,
          bulletSpeed: 10,
          enemyId: enemyInRange.id,
        };
      }
    }

    return tower;
  }
}
