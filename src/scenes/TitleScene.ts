import Phaser from 'phaser';
import { GameState } from '../systems/GameState';
import { SaveService } from '../systems/SaveService';
import { bindSceneInput } from '../systems/sceneInput';

export class TitleScene extends Phaser.Scene {
  private saveService = new SaveService();
  private options: string[] = [];
  private selected = 0;
  private optionTexts: Phaser.GameObjects.Text[] = [];

  constructor() {
    super('TitleScene');
  }

  create(): void {
    const { width, height } = this.scale;
    this.add.rectangle(0, 0, width, height, 0x0a1226, 1).setOrigin(0);
    this.add
      .text(width / 2, height * 0.25, 'TILELANDS', {
        fontFamily: 'monospace',
        fontSize: '64px',
        color: '#ffd166',
      })
      .setOrigin(0.5);
    this.add
      .text(width / 2, height * 0.25 + 60, 'a tiny RPG', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#cccccc',
      })
      .setOrigin(0.5);

    const hasSave = this.saveService.hasSave();
    this.options = hasSave ? ['Continue', 'New Game', 'Erase Save'] : ['New Game'];
    this.optionTexts = [];
    this.selected = 0;
    this.options.forEach((opt, i) => {
      const t = this.add
        .text(width / 2, height * 0.55 + i * 32, opt, {
          fontFamily: 'monospace',
          fontSize: '22px',
          color: '#ffffff',
        })
        .setOrigin(0.5);
      this.optionTexts.push(t);
    });
    this.updateHighlight();

    this.add
      .text(width / 2, height - 30, '[Up/Down] Select   [Enter] Confirm', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#888888',
      })
      .setOrigin(0.5);

    const keyboard = this.input.keyboard!;
    keyboard.on('keydown-UP', () => this.move(-1));
    keyboard.on('keydown-DOWN', () => this.move(1));
    keyboard.on('keydown-W', () => this.move(-1));
    keyboard.on('keydown-S', () => this.move(1));
    keyboard.on('keydown-ENTER', () => this.confirm());
    keyboard.on('keydown-SPACE', () => this.confirm());

    bindSceneInput(this, {
      'press-up': () => this.move(-1),
      'press-down': () => this.move(1),
      action: () => this.confirm(),
    });
  }

  private move(delta: number): void {
    this.selected = (this.selected + delta + this.options.length) % this.options.length;
    this.updateHighlight();
  }

  private updateHighlight(): void {
    this.optionTexts.forEach((t, i) => {
      if (i === this.selected) {
        t.setText(`> ${this.options[i]} <`);
        t.setColor('#ffd166');
      } else {
        t.setText(this.options[i]);
        t.setColor('#ffffff');
      }
    });
  }

  private confirm(): void {
    const choice = this.options[this.selected];
    if (choice === 'New Game') {
      this.saveService.clear();
      this.startWorld(new GameState());
    } else if (choice === 'Continue') {
      const save = this.saveService.load();
      this.startWorld(new GameState(save));
    } else if (choice === 'Erase Save') {
      this.saveService.clear();
      this.scene.restart();
    }
  }

  private startWorld(state: GameState): void {
    if (this.scene.isActive('UIScene')) this.scene.stop('UIScene');
    this.scene.start('WorldScene', { state, saveService: this.saveService });
  }
}
