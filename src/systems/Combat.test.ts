import { describe, it, expect } from 'vitest';
import { ENEMIES } from '../data/enemies';
import {
  awardXp,
  createEnemyState,
  enemyAttack,
  playerAttack,
  rollDamage,
  tryFlee,
} from './Combat';
import type { PlayerStats } from '../types';

const fixedRng = (v: number) => () => v;

function stats(overrides: Partial<PlayerStats> = {}): PlayerStats {
  return {
    hp: 30,
    maxHp: 30,
    attack: 6,
    defense: 2,
    xp: 0,
    level: 1,
    ...overrides,
  };
}

describe('Combat', () => {
  it('rollDamage never goes below 1', () => {
    const dmg = rollDamage(1, 999, fixedRng(0));
    expect(dmg).toBeGreaterThanOrEqual(1);
  });

  it('rollDamage applies min variance with rng=0 (-20%)', () => {
    // base = max(1, 10-2) = 8; 8 * 0.8 = 6.4 -> rounded 6
    expect(rollDamage(10, 2, fixedRng(0))).toBe(6);
  });

  it('rollDamage applies max variance with rng~1 (+20%)', () => {
    // base = 8; 8 * (0.8 + 0.999*0.4) = 8 * 1.1996 = 9.5968 -> rounded 10
    expect(rollDamage(10, 2, fixedRng(0.999))).toBe(10);
  });

  it('playerAttack reduces enemy hp and never below zero', () => {
    const enemy = createEnemyState(ENEMIES.slime);
    enemy.hp = 1;
    playerAttack(stats({ attack: 100 }), enemy, fixedRng(0));
    expect(enemy.hp).toBe(0);
  });

  it('enemyAttack reduces player hp and never below zero', () => {
    const s = stats({ hp: 1 });
    const enemy = createEnemyState(ENEMIES.wolf);
    enemyAttack(enemy, s, fixedRng(0.999));
    expect(s.hp).toBe(0);
  });

  it('tryFlee respects rng threshold', () => {
    expect(tryFlee(fixedRng(0.1), 0.6)).toBe(true);
    expect(tryFlee(fixedRng(0.9), 0.6)).toBe(false);
  });

  it('awardXp levels up at threshold and grants stat boosts', () => {
    const s = stats({ xp: 0, level: 1, maxHp: 30, hp: 10 });
    // level 1 needs 1*20=20 xp
    const result = awardXp(s, 25);
    expect(result.leveledUp).toBe(true);
    expect(s.level).toBe(2);
    expect(s.maxHp).toBe(35);
    expect(s.hp).toBe(35); // refilled on level up
    expect(s.attack).toBe(7);
    expect(s.defense).toBe(3);
    expect(s.xp).toBe(5); // remainder
  });

  it('awardXp can chain multiple levels', () => {
    const s = stats({ xp: 0, level: 1 });
    // L1->L2 needs 20, L2->L3 needs 40 -> total 60
    const result = awardXp(s, 60);
    expect(result.leveledUp).toBe(true);
    expect(s.level).toBe(3);
    expect(s.xp).toBe(0);
  });
});
