import type { ItemDef } from '../types';

export const ITEMS: Record<string, ItemDef> = {
  potion: {
    id: 'potion',
    name: 'Potion',
    description: 'Restores 20 HP.',
    kind: 'consumable',
    heal: 20,
  },
  hi_potion: {
    id: 'hi_potion',
    name: 'Hi-Potion',
    description: 'Restores 60 HP.',
    kind: 'consumable',
    heal: 60,
  },
  ancient_key: {
    id: 'ancient_key',
    name: 'Ancient Key',
    description: 'A rusted key gifted by the elder. Its purpose is unclear.',
    kind: 'key',
  },
};
