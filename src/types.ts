export type Direction = 'up' | 'down' | 'left' | 'right';

export interface ItemDef {
  id: string;
  name: string;
  description: string;
  kind: 'consumable' | 'key';
  heal?: number;
}

export interface InventoryEntry {
  itemId: string;
  count: number;
}

export interface EnemyDef {
  id: string;
  name: string;
  hp: number;
  attack: number;
  defense: number;
  xp: number;
}

export interface PlayerStats {
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  xp: number;
  level: number;
}

export interface DialogueChoice {
  text: string;
  next?: string;
  giveItem?: string;
  setFlag?: string;
}

export interface DialogueNode {
  id: string;
  speaker: string;
  text: string;
  choices?: DialogueChoice[];
  next?: string;
  giveItems?: string[];
  setFlag?: string;
}

export interface DialogueTree {
  start: string;
  nodes: Record<string, DialogueNode>;
}

export interface SaveData {
  version: number;
  player: {
    x: number;
    y: number;
    direction: Direction;
    stats: PlayerStats;
  };
  inventory: InventoryEntry[];
  flags: Record<string, boolean>;
  defeatedEnemies: string[];
  zone: string;
  savedAt: number;
}

export const SAVE_VERSION = 1;
