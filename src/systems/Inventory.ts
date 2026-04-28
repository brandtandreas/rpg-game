import { ITEMS } from '../data/items';
import type { InventoryEntry, ItemDef, PlayerStats } from '../types';

export class Inventory {
  private entries: InventoryEntry[];

  constructor(initial: InventoryEntry[] = []) {
    this.entries = initial.map((e) => ({ ...e }));
  }

  list(): InventoryEntry[] {
    return this.entries.map((e) => ({ ...e }));
  }

  count(itemId: string): number {
    return this.entries.find((e) => e.itemId === itemId)?.count ?? 0;
  }

  add(itemId: string, count = 1): void {
    if (!ITEMS[itemId]) throw new Error(`Unknown item: ${itemId}`);
    const existing = this.entries.find((e) => e.itemId === itemId);
    if (existing) {
      existing.count += count;
    } else {
      this.entries.push({ itemId, count });
    }
  }

  remove(itemId: string, count = 1): boolean {
    const existing = this.entries.find((e) => e.itemId === itemId);
    if (!existing || existing.count < count) return false;
    existing.count -= count;
    if (existing.count === 0) {
      this.entries = this.entries.filter((e) => e.itemId !== itemId);
    }
    return true;
  }

  /**
   * Apply a consumable's effect to the given stats. Returns true if the item
   * was consumed.
   */
  use(itemId: string, stats: PlayerStats): boolean {
    const def: ItemDef | undefined = ITEMS[itemId];
    if (!def || def.kind !== 'consumable') return false;
    if (this.count(itemId) <= 0) return false;
    if (def.heal !== undefined) {
      if (stats.hp >= stats.maxHp) return false;
      stats.hp = Math.min(stats.maxHp, stats.hp + def.heal);
    }
    this.remove(itemId, 1);
    return true;
  }
}
