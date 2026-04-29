import Phaser from 'phaser';
import { ENEMIES } from '../data/enemies';
import { ITEMS } from '../data/items';
import { awardXp, createEnemyState, enemyAttack, playerAttack, tryFlee, type EnemyState } from '../systems/Combat';
import type { GameState } from '../systems/GameState';
import { bindSceneInput } from '../systems/sceneInput';

interface BattleSceneData {
  state: GameState;
  enemyDefId: string;
  enemyId: string;
  onClose: (result: { victory: boolean; fled: boolean }) => void;
}

type Menu = 'root' | 'item';

const ROOT_OPTIONS = ['Attack', 'Item', 'Flee'] as const;

export class BattleScene extends Phaser.Scene {
  private state!: GameState;
  private enemy!: EnemyState;
  private onClose!: BattleSceneData['onClose'];
  private statusText!: Phaser.GameObjects.Text;
  private logText!: Phaser.GameObjects.Text;
  private menuTexts: Phaser.GameObjects.Text[] = [];
  private menu: Menu = 'root';
  private selected = 0;
  private busy = false;
  private log: string[] = [];

  constructor() {
    super('BattleScene');
  }

  init(data: BattleSceneData): void {
    this.state = data.state;
    const def = ENEMIES[data.enemyDefId];
    if (!def) throw new Error(`Unknown enemy: ${data.enemyDefId}`);
    this.enemy = createEnemyState(def);
    this.onClose = data.onClose;
    this.menu = 'root';
    this.selected = 0;
    this.busy = false;
    this.log = [`A ${def.name} appears!`];
    this.menuTexts = [];
  }

  create(): void {
    const { width, height } = this.scale;

    this.add.rectangle(0, 0, width, height, 0x0a1226, 1).setOrigin(0);

    // enemy sprite (top center)
    const enemySprite = this.add.sprite(width / 2, height * 0.35, `enemy_${this.enemy.def.id}`);
    enemySprite.setScale(3);
    enemySprite.setName('enemy');

    this.statusText = this.add.text(0, 0, '', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#ffffff',
    });
    this.refreshStatus();

    this.logText = this.add.text(20, height * 0.55, '', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#ffffff',
      wordWrap: { width: width - 40 },
    });
    this.renderLog();

    this.renderMenu();

    const keyboard = this.input.keyboard!;
    keyboard.on('keydown-UP', () => this.move(-1));
    keyboard.on('keydown-DOWN', () => this.move(1));
    keyboard.on('keydown-W', () => this.move(-1));
    keyboard.on('keydown-S', () => this.move(1));
    keyboard.on('keydown-ENTER', () => this.confirm());
    keyboard.on('keydown-SPACE', () => this.confirm());
    const cancelToRoot = () => {
      if (this.menu === 'item') {
        this.menu = 'root';
        this.selected = 0;
        this.renderMenu();
      }
    };
    keyboard.on('keydown-ESC', cancelToRoot);

    bindSceneInput(this, {
      action: () => this.confirm(),
      cancel: cancelToRoot,
      'press-up': () => this.move(-1),
      'press-down': () => this.move(1),
    });
  }

  private refreshStatus(): void {
    const ps = this.state.player.stats;
    const status = `${this.enemy.def.name}  HP ${this.enemy.hp}/${this.enemy.def.hp}\nHero      HP ${ps.hp}/${ps.maxHp}`;
    this.statusText.setText(status);
    this.statusText.setPosition(20, 16);
  }

  private renderLog(): void {
    this.logText.setText(this.log.slice(-3).join('\n'));
  }

  private renderMenu(): void {
    for (const t of this.menuTexts) t.destroy();
    this.menuTexts = [];

    const options = this.menuOptions();
    const baseY = this.scale.height - 24 * options.length - 20;
    options.forEach((opt, i) => {
      const t = this.add.text(20, baseY + i * 22, `${i === this.selected ? '>' : ' '} ${opt}`, {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: i === this.selected ? '#ffd166' : '#ffffff',
      });
      this.menuTexts.push(t);
    });
  }

  private menuOptions(): string[] {
    if (this.menu === 'root') return ROOT_OPTIONS as unknown as string[];
    const entries = this.state.inventory.list().filter((e) => ITEMS[e.itemId]?.kind === 'consumable');
    if (entries.length === 0) return ['(no items)', 'Back'];
    return [...entries.map((e) => `${ITEMS[e.itemId]?.name ?? e.itemId} x${e.count}`), 'Back'];
  }

  private move(delta: number): void {
    if (this.busy) return;
    const opts = this.menuOptions();
    this.selected = (this.selected + delta + opts.length) % opts.length;
    this.renderMenu();
  }

  private confirm(): void {
    if (this.busy) return;
    if (this.menu === 'root') {
      const choice = ROOT_OPTIONS[this.selected];
      if (choice === 'Attack') this.doAttack();
      else if (choice === 'Item') {
        this.menu = 'item';
        this.selected = 0;
        this.renderMenu();
      } else if (choice === 'Flee') this.doFlee();
    } else {
      this.handleItemMenu();
    }
  }

  private handleItemMenu(): void {
    const opts = this.menuOptions();
    if (opts[this.selected] === 'Back' || opts[this.selected] === '(no items)') {
      this.menu = 'root';
      this.selected = 0;
      this.renderMenu();
      return;
    }
    const consumables = this.state.inventory.list().filter((e) => ITEMS[e.itemId]?.kind === 'consumable');
    const entry = consumables[this.selected];
    if (!entry) return;
    const used = this.state.inventory.use(entry.itemId, this.state.player.stats);
    if (used) {
      this.log.push(`Used ${ITEMS[entry.itemId]?.name ?? entry.itemId}.`);
      this.renderLog();
      this.refreshStatus();
      this.menu = 'root';
      this.selected = 0;
      this.afterPlayerAction();
    } else {
      this.log.push('Cannot use that now.');
      this.renderLog();
    }
  }

  private doAttack(): void {
    const dmg = playerAttack(this.state.player.stats, this.enemy);
    this.log.push(`You hit ${this.enemy.def.name} for ${dmg}.`);
    this.renderLog();
    this.refreshStatus();
    this.afterPlayerAction();
  }

  private doFlee(): void {
    if (tryFlee()) {
      this.log.push('You fled successfully!');
      this.renderLog();
      this.busy = true;
      this.time.delayedCall(700, () => this.onClose({ victory: false, fled: true }));
    } else {
      this.log.push('You failed to flee.');
      this.renderLog();
      this.afterPlayerAction();
    }
  }

  private afterPlayerAction(): void {
    if (this.enemy.hp <= 0) {
      this.log.push(`${this.enemy.def.name} is defeated!`);
      const xp = this.enemy.def.xp;
      const result = awardXp(this.state.player.stats, xp);
      this.log.push(`Gained ${xp} XP.${result.leveledUp ? ' Level up!' : ''}`);
      this.renderLog();
      this.refreshStatus();
      this.busy = true;
      this.time.delayedCall(900, () => this.onClose({ victory: true, fled: false }));
      return;
    }
    this.busy = true;
    this.renderMenu();
    this.time.delayedCall(500, () => this.enemyTurn());
  }

  private enemyTurn(): void {
    const dmg = enemyAttack(this.enemy, this.state.player.stats);
    this.log.push(`${this.enemy.def.name} hits you for ${dmg}.`);
    this.renderLog();
    this.refreshStatus();
    if (this.state.player.stats.hp <= 0) {
      this.log.push('You collapse...');
      this.renderLog();
      this.time.delayedCall(900, () => this.onClose({ victory: false, fled: false }));
      return;
    }
    this.busy = false;
    this.menu = 'root';
    this.selected = 0;
    this.renderMenu();
  }
}
