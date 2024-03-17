import { Enemy } from "./enemies_manager";
import { ACTION_CANVAS_ID, CELL_SIZE, Component, GameState, getCanvasInitialPosition } from "./main";
import { GridPosition, Vector, gridPositionToVector, vectorToGridPosition } from "./utils/helper";

export interface Tower {
  id: string;
  currentPosition: GridPosition;
  range: number;
  damage: number;
  lastTimeFired: number;
  bullet?: {
    bulletSpeed: number;
    bulletPosition: Vector;
    bulletTarget: Vector;
    enemyId?: string;
  };
  sleep: number;
}

export class TowersManager implements Component {
  update(state: GameState, time: number) {
    const { towers } = state;
    const newTowers: Tower[] = [];
    const updatedEnemies: Record<string, Enemy> = {};

    for (const tower of towers) {
      const { tower: newTower, enemy } = this.updateTower(tower, state, time);
      newTowers.push(newTower);
      if (enemy) {
        updatedEnemies[enemy.id] = enemy;
      }
    }

    const newEnemies = state.enemies.map((enemy) => {
      const updatedEnemy = updatedEnemies[enemy.id];
      return updatedEnemy || enemy;
    });

    return { ...state, towers: newTowers, enemies: newEnemies };
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

  private updateTower(tower: Tower, state: GameState, time: number): { tower: Tower; enemy?: Enemy } {
    const { enemies } = state;
    const { currentPosition: towerPosition, bullet, lastTimeFired } = tower;

    if (bullet) {
      const { bulletPosition, bulletSpeed, enemyId } = bullet;
      const enemy = enemies.find((enemy) => enemy.id === enemyId);
      if (!enemy) {
        tower.bullet = undefined;
        return { tower };
      }

      const { currentPosition: enemyPosition } = enemy;
      const dx = enemyPosition.x - bulletPosition.x;
      const dy = enemyPosition.y - bulletPosition.y;

      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 5) {
        tower.bullet = undefined;
        const newEnemy = { ...enemy, life: enemy.life - tower.damage };

        return { tower, enemy: newEnemy };
      } else {
        const bulletX = bulletPosition.x + (dx / distance) * bulletSpeed;
        const bulletY = bulletPosition.y + (dy / distance) * bulletSpeed;

        tower.bullet = {
          bulletPosition: { x: bulletX, y: bulletY },
          bulletTarget: enemyPosition,
          bulletSpeed,
          enemyId,
        };

        return { tower };
      }
    }
    // find random enemy
    const enemiesInRange = enemies.filter((enemy) => {
      const { currentPosition: enemyPosition } = enemy;
      const enemyGridPosition = vectorToGridPosition(enemyPosition);
      return this.isEnemyInRange(towerPosition, enemyGridPosition, tower.range);
    });

    const enemyInRange = enemiesInRange[0];

    if (enemyInRange) {
      if (time - lastTimeFired < 500) {
        return { tower };
      }

      const { currentPosition: enemyPosition } = enemyInRange;

      const bulletPosition = gridPositionToVector(towerPosition);

      tower.bullet = {
        bulletPosition,
        bulletTarget: enemyPosition,
        bulletSpeed: 5,
        enemyId: enemyInRange.id,
      };
      tower.lastTimeFired = time;
    }

    return { tower };
  }

  private isEnemyInRange(towerPosition: GridPosition, enemyPosition: GridPosition, towerRange: number) {
    // find if is in the range using grid position

    return (
      Math.abs(towerPosition.row - enemyPosition.row) <= towerRange &&
      Math.abs(towerPosition.col - enemyPosition.col) <= towerRange
    );
  }
}
