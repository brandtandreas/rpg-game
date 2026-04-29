import Phaser from 'phaser';
import { inputBus, isTouchDevice, virtualPad, type InputEvent } from '../systems/inputBus';

const PAD_RADIUS = 28;
const PAD_OFFSET = 56;
const PAD_CENTER = { x: 80, y: 380 };
const ACTION_RADIUS = 32;

type DirKey = 'up' | 'down' | 'left' | 'right';

interface DirButton {
  visual: Phaser.GameObjects.Arc;
  dir: DirKey;
}

export class TouchScene extends Phaser.Scene {
  private dirButtons: DirButton[] = [];

  constructor() {
    super({ key: 'TouchScene', active: false });
  }

  create(): void {
    if (!isTouchDevice()) return;

    this.input.setTopOnly(false);

    // D-pad: + cross around PAD_CENTER
    const pad: { dir: DirKey; dx: number; dy: number; glyph: string }[] = [
      { dir: 'up', dx: 0, dy: -PAD_OFFSET, glyph: '▲' },
      { dir: 'down', dx: 0, dy: PAD_OFFSET, glyph: '▼' },
      { dir: 'left', dx: -PAD_OFFSET, dy: 0, glyph: '◀' },
      { dir: 'right', dx: PAD_OFFSET, dy: 0, glyph: '▶' },
    ];
    for (const b of pad) {
      const x = PAD_CENTER.x + b.dx;
      const y = PAD_CENTER.y + b.dy;
      this.dirButtons.push(this.makeDirButton(x, y, b.dir, b.glyph));
    }

    // Right-side action buttons
    this.makeActionButton(560, 380, 'A', 0xff7a59, 'action');
    this.makeActionButton(488, 380, 'B', 0x6c7a89, 'cancel');
    this.makeActionButton(560, 308, 'I', 0x4a8b3a, 'inventory');

    // Small save button, top-right
    this.makeActionButton(610, 28, 'S', 0x2c5fa8, 'save', 18);

    // Reset pad state if we lose pointer mid-press (e.g. user drags off canvas)
    this.input.on(Phaser.Input.Events.POINTER_UP_OUTSIDE, () => this.releaseAll());
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => this.releaseAll());
  }

  private makeDirButton(x: number, y: number, dir: DirKey, glyph: string): DirButton {
    const visual = this.add.circle(x, y, PAD_RADIUS, 0x111111, 0.55).setStrokeStyle(2, 0xffffff, 0.6);
    this.add
      .text(x, y, glyph, {
        fontFamily: 'monospace',
        fontSize: '20px',
        color: '#ffffff',
      })
      .setOrigin(0.5);
    const hit = this.add.zone(x, y, PAD_RADIUS * 2 + 12, PAD_RADIUS * 2 + 12).setInteractive();

    const press = () => {
      virtualPad[dir] = true;
      visual.setFillStyle(0x333333, 0.85);
      inputBus.emit(`press-${dir}` satisfies InputEvent);
    };
    const release = () => {
      virtualPad[dir] = false;
      visual.setFillStyle(0x111111, 0.55);
    };

    hit.on(Phaser.Input.Events.POINTER_DOWN, press);
    hit.on(Phaser.Input.Events.POINTER_UP, release);
    hit.on(Phaser.Input.Events.POINTER_OUT, release);
    hit.on(Phaser.Input.Events.POINTER_UP_OUTSIDE, release);

    return { visual, dir };
  }

  private makeActionButton(
    x: number,
    y: number,
    label: string,
    color: number,
    event: InputEvent,
    radius = ACTION_RADIUS,
  ): void {
    const visual = this.add.circle(x, y, radius, color, 0.7).setStrokeStyle(2, 0xffffff, 0.7);
    const text = this.add
      .text(x, y, label, {
        fontFamily: 'monospace',
        fontSize: `${Math.round(radius * 0.7)}px`,
        color: '#ffffff',
      })
      .setOrigin(0.5);
    const hit = this.add.zone(x, y, radius * 2 + 8, radius * 2 + 8).setInteractive();

    hit.on(Phaser.Input.Events.POINTER_DOWN, () => {
      visual.setFillStyle(color, 1);
      visual.setScale(0.9);
      text.setScale(0.9);
      inputBus.emit(event);
    });
    const release = () => {
      visual.setFillStyle(color, 0.7);
      visual.setScale(1);
      text.setScale(1);
    };
    hit.on(Phaser.Input.Events.POINTER_UP, release);
    hit.on(Phaser.Input.Events.POINTER_OUT, release);
    hit.on(Phaser.Input.Events.POINTER_UP_OUTSIDE, release);
  }

  private releaseAll(): void {
    for (const b of this.dirButtons) {
      virtualPad[b.dir] = false;
      b.visual.setFillStyle(0x111111, 0.55);
    }
  }
}
