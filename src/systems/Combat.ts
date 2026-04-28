import type { EnemyDef, PlayerStats } from '../types';

export interface EnemyState {
  def: EnemyDef;
  hp: number;
}

export type CombatRng = () => number;

const defaultRng: CombatRng = Math.random;

export function createEnemyState(def: EnemyDef): EnemyState {
  return { def, hp: def.hp };
}

/**
 * Simple damage formula: max(1, attacker_atk - defender_def) with ±20% variance.
 */
export function rollDamage(attack: number, defense: number, rng: CombatRng = defaultRng): number {
  const base = Math.max(1, attack - defense);
  const variance = 0.8 + rng() * 0.4;
  return Math.max(1, Math.round(base * variance));
}

export function playerAttack(
  player: PlayerStats,
  enemy: EnemyState,
  rng: CombatRng = defaultRng,
): number {
  const dmg = rollDamage(player.attack, enemy.def.defense, rng);
  enemy.hp = Math.max(0, enemy.hp - dmg);
  return dmg;
}

export function enemyAttack(
  enemy: EnemyState,
  player: PlayerStats,
  rng: CombatRng = defaultRng,
): number {
  const dmg = rollDamage(enemy.def.attack, player.defense, rng);
  player.hp = Math.max(0, player.hp - dmg);
  return dmg;
}

/**
 * Flee succeeds 60% of the time by default.
 */
export function tryFlee(rng: CombatRng = defaultRng, chance = 0.6): boolean {
  return rng() < chance;
}

const XP_PER_LEVEL = 20;

export function awardXp(player: PlayerStats, amount: number): { leveledUp: boolean } {
  player.xp += amount;
  let leveledUp = false;
  while (player.xp >= player.level * XP_PER_LEVEL) {
    player.xp -= player.level * XP_PER_LEVEL;
    player.level += 1;
    player.maxHp += 5;
    player.hp = player.maxHp;
    player.attack += 1;
    player.defense += 1;
    leveledUp = true;
  }
  return { leveledUp };
}
