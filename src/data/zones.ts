/**
 * Tile codes:
 *   0 = grass (walkable)
 *   1 = path (walkable)
 *   2 = water (blocked)
 *   3 = tree (blocked)
 *   4 = rock (blocked)
 */
export const TILE_GRASS = 0;
export const TILE_PATH = 1;
export const TILE_WATER = 2;
export const TILE_TREE = 3;
export const TILE_ROCK = 4;

export const TILE_KEYS: Record<number, string> = {
  0: 'tile_grass',
  1: 'tile_path',
  2: 'tile_water',
  3: 'tile_tree',
  4: 'tile_rock',
};

export const BLOCKED = new Set([TILE_WATER, TILE_TREE, TILE_ROCK]);

export interface NPCSpawn {
  id: string;
  x: number;
  y: number;
  texture: string;
  dialogueId: string;
  name: string;
}

export interface EnemySpawn {
  id: string;
  x: number;
  y: number;
  texture: string;
  enemyDefId: string;
}

export interface Zone {
  id: string;
  width: number;
  height: number;
  tiles: number[][];
  spawn: { x: number; y: number };
  npcs: NPCSpawn[];
  enemies: EnemySpawn[];
}

const T = TILE_TREE;
const G = TILE_GRASS;
const P = TILE_PATH;
const W = TILE_WATER;
const R = TILE_ROCK;

// 20 columns x 15 rows = 640x480 at 32px tiles
const tiles: number[][] = [
  [T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T],
  [T, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, T],
  [T, G, G, G, G, G, G, G, G, P, P, G, G, G, G, R, G, G, G, T],
  [T, G, G, R, G, G, G, G, G, P, G, G, G, G, G, G, G, G, G, T],
  [T, G, G, G, G, G, G, G, G, P, G, G, G, G, G, G, G, G, G, T],
  [T, G, G, G, G, G, P, P, P, P, G, G, G, W, W, G, G, G, G, T],
  [T, G, G, G, G, G, P, G, G, G, G, G, W, W, W, W, G, G, G, T],
  [T, G, G, G, G, G, P, G, G, G, G, G, W, W, W, W, G, G, G, T],
  [T, G, G, G, G, G, P, G, G, G, G, G, G, W, W, G, G, G, G, T],
  [T, G, G, G, G, G, P, G, G, G, G, G, G, G, G, G, G, G, R, T],
  [T, G, G, G, G, G, P, G, G, G, G, G, G, G, G, G, G, G, G, T],
  [T, G, R, G, G, G, P, P, P, G, G, G, G, R, G, G, G, G, G, T],
  [T, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, T],
  [T, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, T],
  [T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T],
];

export const FOREST_CLEARING: Zone = {
  id: 'forest_clearing',
  width: 20,
  height: 15,
  tiles,
  spawn: { x: 4 * 32 + 16, y: 7 * 32 + 16 },
  npcs: [
    {
      id: 'elder_maren',
      x: 9 * 32 + 16,
      y: 4 * 32 + 16,
      texture: 'npc_elder',
      dialogueId: 'intro',
      name: 'Elder Maren',
    },
  ],
  enemies: [
    { id: 'slime_a', x: 14 * 32 + 16, y: 10 * 32 + 16, texture: 'enemy_slime', enemyDefId: 'slime' },
    { id: 'slime_b', x: 16 * 32 + 16, y: 3 * 32 + 16, texture: 'enemy_slime', enemyDefId: 'slime' },
  ],
};

export const ZONES: Record<string, Zone> = {
  forest_clearing: FOREST_CLEARING,
};
