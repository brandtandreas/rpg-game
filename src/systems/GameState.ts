import { Inventory } from './Inventory';
import type { Direction, PlayerStats, SaveData } from '../types';

export class GameState {
  player: {
    x: number;
    y: number;
    direction: Direction;
    stats: PlayerStats;
  };
  inventory: Inventory;
  flags: Record<string, boolean>;
  defeatedEnemies: Set<string>;
  zone: string;

  constructor(save?: SaveData | null) {
    if (save) {
      this.player = {
        x: save.player.x,
        y: save.player.y,
        direction: save.player.direction,
        stats: { ...save.player.stats },
      };
      this.inventory = new Inventory(save.inventory);
      this.flags = { ...save.flags };
      this.defeatedEnemies = new Set(save.defeatedEnemies);
      this.zone = save.zone;
    } else {
      this.player = {
        x: 6 * 32,
        y: 6 * 32,
        direction: 'down',
        stats: {
          hp: 30,
          maxHp: 30,
          attack: 6,
          defense: 2,
          xp: 0,
          level: 1,
        },
      };
      this.inventory = new Inventory([{ itemId: 'potion', count: 1 }]);
      this.flags = {};
      this.defeatedEnemies = new Set();
      this.zone = 'forest_clearing';
    }
  }

  toSaveData(): Omit<SaveData, 'version' | 'savedAt'> {
    return {
      player: {
        x: this.player.x,
        y: this.player.y,
        direction: this.player.direction,
        stats: { ...this.player.stats },
      },
      inventory: this.inventory.list(),
      flags: { ...this.flags },
      defeatedEnemies: Array.from(this.defeatedEnemies),
      zone: this.zone,
    };
  }
}
