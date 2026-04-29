import Phaser from 'phaser';
import { ITEMS } from '../data/items';
import type { GameState } from '../systems/GameState';
import { inputBus } from '../systems/inputBus';

interface UISceneData {
  state: GameState;
}

export class UIScene extends Phaser.Scene {
  private state!: GameState;
  private hudText!: Phaser.GameObjects.Text;
  private inventoryPanel?: Phaser.GameObjects.Container;
  private selectedSlot = 0;

  constructor() {
    super('UIScene');
  }

  init(data: UISceneData): void {
    this.state = data.state;
  }

  create(): void {
    this.hudText = this.add
      .text(8, 8, '', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#ffffff',
        backgroundColor: '#000000aa',
        padding: { x: 8, y: 4 },
      })
      .setScrollFactor(0)
      .setDepth(1000);

    const hint = this.add
      .text(8, this.scale.height - 8, '[Arrows/WASD] Move  [E] Talk  [I] Inventory  [F5] Save', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#cccccc',
        backgroundColor: '#000000aa',
        padding: { x: 6, y: 3 },
      })
      .setOrigin(0, 1)
      .setScrollFactor(0)
      .setDepth(1000);
    hint.setName('hud-hint');

    this.refreshHud();

    this.events.on('hud:refresh', () => this.refreshHud());
    this.events.on('hud:toggle-inventory', () => this.toggleInventory());
  }

  private refreshHud(): void {
    const s = this.state.player.stats;
    this.hudText.setText(`HP ${s.hp}/${s.maxHp}   ATK ${s.attack}   DEF ${s.defense}   LV ${s.level}  XP ${s.xp}`);
    if (this.inventoryPanel) this.renderInventoryContents();
  }

  private toggleInventory(): void {
    if (this.inventoryPanel) {
      this.inventoryPanel.destroy(true);
      this.inventoryPanel = undefined;
      return;
    }
    this.openInventory();
  }

  private openInventory(): void {
    const w = 360;
    const h = 240;
    const x = (this.scale.width - w) / 2;
    const y = (this.scale.height - h) / 2;
    const panel = this.add.container(x, y).setDepth(1500).setScrollFactor(0);

    const bg = this.add.rectangle(0, 0, w, h, 0x000000, 0.9).setOrigin(0).setStrokeStyle(2, 0xffffff, 0.6);
    const title = this.add.text(12, 10, 'Inventory', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ffd166',
    });
    const hint = this.add.text(12, h - 22, '[Up/Down] Select  [Enter] Use  [I/Esc] Close', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#aaaaaa',
    });
    panel.add([bg, title, hint]);
    this.inventoryPanel = panel;
    this.selectedSlot = 0;
    this.renderInventoryContents();

    const keyboard = this.input.keyboard!;
    const onUp = () => this.moveSlot(-1);
    const onDown = () => this.moveSlot(1);
    const onEnter = () => this.useSelected();
    const onClose = () => this.toggleInventory();
    keyboard.on('keydown-UP', onUp);
    keyboard.on('keydown-DOWN', onDown);
    keyboard.on('keydown-W', onUp);
    keyboard.on('keydown-S', onDown);
    keyboard.on('keydown-ENTER', onEnter);
    keyboard.on('keydown-ESC', onClose);
    inputBus.on('press-up', onUp);
    inputBus.on('press-down', onDown);
    inputBus.on('action', onEnter);
    inputBus.on('cancel', onClose);
    inputBus.on('inventory', onClose);
    panel.once('destroy', () => {
      keyboard.off('keydown-UP', onUp);
      keyboard.off('keydown-DOWN', onDown);
      keyboard.off('keydown-W', onUp);
      keyboard.off('keydown-S', onDown);
      keyboard.off('keydown-ENTER', onEnter);
      keyboard.off('keydown-ESC', onClose);
      inputBus.off('press-up', onUp);
      inputBus.off('press-down', onDown);
      inputBus.off('action', onEnter);
      inputBus.off('cancel', onClose);
      inputBus.off('inventory', onClose);
    });
  }

  private renderInventoryContents(): void {
    if (!this.inventoryPanel) return;
    // Remove old slot texts (everything tagged 'slot')
    this.inventoryPanel.list
      .filter((c) => c.getData?.('slot'))
      .forEach((c) => c.destroy());

    const entries = this.state.inventory.list();
    if (entries.length === 0) {
      const empty = this.add
        .text(12, 50, '(empty)', {
          fontFamily: 'monospace',
          fontSize: '14px',
          color: '#888888',
        })
        .setData('slot', true);
      this.inventoryPanel.add(empty);
      return;
    }
    if (this.selectedSlot >= entries.length) this.selectedSlot = entries.length - 1;
    entries.forEach((entry, i) => {
      const def = ITEMS[entry.itemId];
      const label = `${i === this.selectedSlot ? '>' : ' '} ${def?.name ?? entry.itemId} x${entry.count}`;
      const text = this.add
        .text(20, 50 + i * 22, label, {
          fontFamily: 'monospace',
          fontSize: '14px',
          color: i === this.selectedSlot ? '#ffd166' : '#ffffff',
        })
        .setData('slot', true);
      this.inventoryPanel!.add(text);
    });

    const selectedEntry = entries[this.selectedSlot];
    if (selectedEntry) {
      const def = ITEMS[selectedEntry.itemId];
      const desc = this.add
        .text(20, 50 + entries.length * 22 + 10, def?.description ?? '', {
          fontFamily: 'monospace',
          fontSize: '12px',
          color: '#cccccc',
          wordWrap: { width: 320 },
        })
        .setData('slot', true);
      this.inventoryPanel.add(desc);
    }
  }

  private moveSlot(delta: number): void {
    const entries = this.state.inventory.list();
    if (entries.length === 0) return;
    this.selectedSlot = (this.selectedSlot + delta + entries.length) % entries.length;
    this.renderInventoryContents();
  }

  private useSelected(): void {
    const entries = this.state.inventory.list();
    const entry = entries[this.selectedSlot];
    if (!entry) return;
    const used = this.state.inventory.use(entry.itemId, this.state.player.stats);
    if (used) this.refreshHud();
  }
}
