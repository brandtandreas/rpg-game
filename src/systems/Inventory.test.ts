import { describe, it, expect } from 'vitest';
import { Inventory } from './Inventory';
import type { PlayerStats } from '../types';

function stats(overrides: Partial<PlayerStats> = {}): PlayerStats {
  return {
    hp: 10,
    maxHp: 30,
    attack: 5,
    defense: 1,
    xp: 0,
    level: 1,
    ...overrides,
  };
}

describe('Inventory', () => {
  it('starts empty by default', () => {
    const inv = new Inventory();
    expect(inv.list()).toEqual([]);
    expect(inv.count('potion')).toBe(0);
  });

  it('adds and stacks items', () => {
    const inv = new Inventory();
    inv.add('potion');
    inv.add('potion', 2);
    expect(inv.count('potion')).toBe(3);
    expect(inv.list()).toEqual([{ itemId: 'potion', count: 3 }]);
  });

  it('rejects unknown items', () => {
    const inv = new Inventory();
    expect(() => inv.add('not_real')).toThrow();
  });

  it('removes items and clears empty stacks', () => {
    const inv = new Inventory([{ itemId: 'potion', count: 2 }]);
    expect(inv.remove('potion')).toBe(true);
    expect(inv.count('potion')).toBe(1);
    expect(inv.remove('potion')).toBe(true);
    expect(inv.list()).toEqual([]);
  });

  it('refuses to over-remove', () => {
    const inv = new Inventory([{ itemId: 'potion', count: 1 }]);
    expect(inv.remove('potion', 2)).toBe(false);
    expect(inv.count('potion')).toBe(1);
  });

  it('use() heals capped at maxHp and consumes the item', () => {
    const inv = new Inventory([{ itemId: 'potion', count: 1 }]);
    const s = stats({ hp: 25, maxHp: 30 });
    expect(inv.use('potion', s)).toBe(true);
    expect(s.hp).toBe(30); // capped
    expect(inv.count('potion')).toBe(0);
  });

  it('use() returns false at full HP and does not consume', () => {
    const inv = new Inventory([{ itemId: 'potion', count: 1 }]);
    const s = stats({ hp: 30, maxHp: 30 });
    expect(inv.use('potion', s)).toBe(false);
    expect(inv.count('potion')).toBe(1);
  });

  it('use() ignores key items', () => {
    const inv = new Inventory([{ itemId: 'ancient_key', count: 1 }]);
    const s = stats({ hp: 5 });
    expect(inv.use('ancient_key', s)).toBe(false);
    expect(inv.count('ancient_key')).toBe(1);
  });
});
