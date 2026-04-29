import Phaser from 'phaser';
import { DialogueRunner } from '../systems/DialogueRunner';
import { DIALOGUES } from '../data/dialogues';
import type { GameState } from '../systems/GameState';
import { bindSceneInput } from '../systems/sceneInput';

interface DialogueSceneData {
  state: GameState;
  dialogueId: string;
  onClose: () => void;
}

const PANEL_HEIGHT = 180;
const PADDING = 16;

export class DialogueScene extends Phaser.Scene {
  private state!: GameState;
  private runner!: DialogueRunner;
  private onClose!: () => void;
  private speakerText!: Phaser.GameObjects.Text;
  private bodyText!: Phaser.GameObjects.Text;
  private hint!: Phaser.GameObjects.Text;
  private choiceTexts: Phaser.GameObjects.Text[] = [];
  private selectedChoice = 0;
  private finished = false;

  constructor() {
    super('DialogueScene');
  }

  init(data: DialogueSceneData): void {
    this.state = data.state;
    this.onClose = data.onClose;
    const tree = DIALOGUES[data.dialogueId];
    if (!tree) throw new Error(`Unknown dialogue: ${data.dialogueId}`);
    this.runner = new DialogueRunner(tree, {
      giveItem: (id) => this.state.inventory.add(id, 1),
      setFlag: (flag) => {
        this.state.flags[flag] = true;
      },
    });
    this.choiceTexts = [];
    this.selectedChoice = 0;
    this.finished = false;
  }

  create(): void {
    const { width, height } = this.scale;
    const top = height - PANEL_HEIGHT;

    this.add
      .rectangle(0, top, width, PANEL_HEIGHT, 0x000000, 0.85)
      .setOrigin(0)
      .setStrokeStyle(2, 0xffffff, 0.5);

    this.speakerText = this.add.text(PADDING, top + PADDING, '', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#ffd166',
    });

    this.bodyText = this.add.text(PADDING, top + PADDING + 24, '', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ffffff',
      wordWrap: { width: width - PADDING * 2 },
    });

    this.hint = this.add
      .text(width - PADDING, height - PADDING, '[Space/Enter] Continue', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#aaaaaa',
      })
      .setOrigin(1, 1);

    this.renderCurrent();

    const keyboard = this.input.keyboard!;
    keyboard.on('keydown-SPACE', () => this.advance());
    keyboard.on('keydown-ENTER', () => this.advance());
    keyboard.on('keydown-E', () => this.advance());
    keyboard.on('keydown-UP', () => this.moveChoice(-1));
    keyboard.on('keydown-DOWN', () => this.moveChoice(1));
    keyboard.on('keydown-W', () => this.moveChoice(-1));
    keyboard.on('keydown-S', () => this.moveChoice(1));
    keyboard.on('keydown-ESC', () => this.close());

    bindSceneInput(this, {
      action: () => this.advance(),
      cancel: () => this.close(),
      'press-up': () => this.moveChoice(-1),
      'press-down': () => this.moveChoice(1),
    });
  }

  private renderCurrent(): void {
    for (const t of this.choiceTexts) t.destroy();
    this.choiceTexts = [];

    const node = this.runner.current();
    this.speakerText.setText(node.speaker);
    this.bodyText.setText(node.text);

    if (node.choices && node.choices.length > 0) {
      const top = this.scale.height - PANEL_HEIGHT;
      const startY = top + PANEL_HEIGHT - PADDING - node.choices.length * 22;
      node.choices.forEach((choice, i) => {
        const t = this.add.text(PADDING + 20, startY + i * 22, `  ${choice.text}`, {
          fontFamily: 'monospace',
          fontSize: '15px',
          color: '#ffffff',
        });
        this.choiceTexts.push(t);
      });
      this.selectedChoice = 0;
      this.updateChoiceHighlight();
      this.hint.setText('[Up/Down] Select  [Space/Enter] Choose');
    } else {
      this.hint.setText(this.runner.isFinished() ? '[Space/Enter] Close' : '[Space/Enter] Continue');
    }
  }

  private moveChoice(delta: number): void {
    if (this.choiceTexts.length === 0) return;
    this.selectedChoice = (this.selectedChoice + delta + this.choiceTexts.length) % this.choiceTexts.length;
    this.updateChoiceHighlight();
  }

  private updateChoiceHighlight(): void {
    const node = this.runner.current();
    if (!node.choices) return;
    this.choiceTexts.forEach((t, i) => {
      if (i === this.selectedChoice) {
        t.setText(`> ${node.choices![i].text}`);
        t.setColor('#ffd166');
      } else {
        t.setText(`  ${node.choices![i].text}`);
        t.setColor('#ffffff');
      }
    });
  }

  private advance(): void {
    if (this.finished) {
      this.close();
      return;
    }
    const node = this.runner.current();
    let next;
    if (node.choices && node.choices.length > 0) {
      next = this.runner.choose(this.selectedChoice);
    } else {
      next = this.runner.advance();
    }
    if (next) {
      this.renderCurrent();
    } else {
      this.finished = true;
      this.hint.setText('[Space/Enter] Close');
    }
  }

  private close(): void {
    this.onClose();
  }
}
