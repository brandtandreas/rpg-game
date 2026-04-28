import type { EnemyDef } from '../types';

export const ENEMIES: Record<string, EnemyDef> = {
  slime: {
    id: 'slime',
    name: 'Forest Slime',
    hp: 18,
    attack: 4,
    defense: 1,
    xp: 6,
  },
  wolf: {
    id: 'wolf',
    name: 'Lone Wolf',
    hp: 28,
    attack: 7,
    defense: 2,
    xp: 12,
  },
};
