import { describe, it, expect, beforeEach } from 'vitest';
import { SaveService, type Storage } from './SaveService';
import { GameState } from './GameState';
import { SAVE_VERSION } from '../types';

class MemoryStorage implements Storage {
  private map = new Map<string, string>();
  getItem(key: string): string | null {
    return this.map.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
  removeItem(key: string): void {
    this.map.delete(key);
  }
}

describe('SaveService', () => {
  let storage: MemoryStorage;
  let svc: SaveService;

  beforeEach(() => {
    storage = new MemoryStorage();
    svc = new SaveService(storage);
  });

  it('reports no save when empty', () => {
    expect(svc.hasSave()).toBe(false);
    expect(svc.load()).toBeNull();
  });

  it('round-trips game state', () => {
    const state = new GameState();
    state.player.x = 123;
    state.player.y = 456;
    state.player.stats.hp = 7;
    state.inventory.add('potion', 3);
    state.flags['met_elder'] = true;
    state.defeatedEnemies.add('slime_a');

    const saved = svc.save(state.toSaveData());
    expect(saved.version).toBe(SAVE_VERSION);
    expect(saved.savedAt).toBeGreaterThan(0);

    expect(svc.hasSave()).toBe(true);
    const loaded = svc.load();
    expect(loaded).not.toBeNull();
    expect(loaded!.player.x).toBe(123);
    expect(loaded!.player.y).toBe(456);
    expect(loaded!.player.stats.hp).toBe(7);
    expect(loaded!.inventory).toContainEqual({ itemId: 'potion', count: 4 }); // 1 starter + 3
    expect(loaded!.flags.met_elder).toBe(true);
    expect(loaded!.defeatedEnemies).toContain('slime_a');
  });

  it('rebuilds GameState from a loaded save', () => {
    const original = new GameState();
    original.player.stats.hp = 12;
    original.inventory.add('hi_potion', 2);
    svc.save(original.toSaveData());

    const restored = new GameState(svc.load());
    expect(restored.player.stats.hp).toBe(12);
    expect(restored.inventory.count('hi_potion')).toBe(2);
  });

  it('clear() removes the save', () => {
    svc.save(new GameState().toSaveData());
    expect(svc.hasSave()).toBe(true);
    svc.clear();
    expect(svc.hasSave()).toBe(false);
  });

  it('returns null for mismatched version', () => {
    storage.setItem('tilelands.save.v1', JSON.stringify({ version: 999 }));
    expect(svc.load()).toBeNull();
  });

  it('returns null for malformed JSON', () => {
    storage.setItem('tilelands.save.v1', 'not json');
    expect(svc.load()).toBeNull();
  });
});
