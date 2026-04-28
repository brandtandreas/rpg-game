import Phaser from 'phaser';
import { Player, type WASDKeys } from '../entities/Player';
import { NPC } from '../entities/NPC';
import { TILE_SIZE } from './textures';
import { BLOCKED, TILE_KEYS, ZONES, type EnemySpawn, type Zone } from '../data/zones';
import type { GameState } from '../systems/GameState';
import { SaveService } from '../systems/SaveService';

interface WorldSceneInitData {
  state: GameState;
  saveService: SaveService;
  fromBattle?: { enemyId: string; victory: boolean };
}

export class WorldScene extends Phaser.Scene {
  private state!: GameState;
  private saveService!: SaveService;
  private player!: Player;
  private npcs: NPC[] = [];
  private enemySprites: { spawn: EnemySpawn; sprite: Phaser.Physics.Arcade.Sprite }[] = [];
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: WASDKeys;
  private interactKey!: Phaser.Input.Keyboard.Key;
  private inventoryKey!: Phaser.Input.Keyboard.Key;
  private saveKey!: Phaser.Input.Keyboard.Key;
  private pendingFromBattle?: { enemyId: string; victory: boolean };

  constructor() {
    super('WorldScene');
  }

  init(data: WorldSceneInitData): void {
    this.state = data.state;
    this.saveService = data.saveService;
    this.pendingFromBattle = data.fromBattle;
    // Reset transient lists - init() runs every time the scene starts
    this.npcs = [];
    this.enemySprites = [];
  }

  create(): void {
    const zone: Zone = ZONES[this.state.zone];
    if (!zone) throw new Error(`Unknown zone: ${this.state.zone}`);

    const worldW = zone.width * TILE_SIZE;
    const worldH = zone.height * TILE_SIZE;
    this.physics.world.setBounds(0, 0, worldW, worldH);
    this.cameras.main.setBounds(0, 0, worldW, worldH);
    this.cameras.main.setBackgroundColor('#1a1a1a');

    const blockers = this.physics.add.staticGroup();
    for (let row = 0; row < zone.height; row++) {
      for (let col = 0; col < zone.width; col++) {
        const tile = zone.tiles[row][col];
        const key = TILE_KEYS[tile];
        const px = col * TILE_SIZE + TILE_SIZE / 2;
        const py = row * TILE_SIZE + TILE_SIZE / 2;
        this.add.image(px, py, key);
        if (BLOCKED.has(tile)) {
          const blocker = this.physics.add.staticImage(px, py, key);
          blocker.setVisible(false);
          blocker.refreshBody();
          blockers.add(blocker);
        }
      }
    }

    this.player = new Player(this, this.state.player.x, this.state.player.y);
    this.player.direction = this.state.player.direction;
    this.physics.add.collider(this.player.sprite, blockers);
    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);

    for (const spawn of zone.npcs) {
      const npc = new NPC(this, spawn.id, spawn.x, spawn.y, spawn.texture, spawn.dialogueId, spawn.name);
      this.npcs.push(npc);
      this.physics.add.collider(this.player.sprite, npc.sprite);
    }

    for (const spawn of zone.enemies) {
      if (this.state.defeatedEnemies.has(spawn.id)) continue;
      const sprite = this.physics.add.sprite(spawn.x, spawn.y, spawn.texture);
      sprite.setImmovable(true);
      (sprite.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
      (sprite.body as Phaser.Physics.Arcade.Body).moves = false;
      this.enemySprites.push({ spawn, sprite });
      this.physics.add.overlap(this.player.sprite, sprite, () => this.startBattle(spawn));
    }

    const keyboard = this.input.keyboard!;
    this.cursors = keyboard.createCursorKeys();
    this.wasd = {
      W: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.interactKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.inventoryKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
    this.saveKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F5);

    // Launch UI overlay if not already running
    if (!this.scene.isActive('UIScene')) {
      this.scene.launch('UIScene', { state: this.state });
    } else {
      this.scene.get('UIScene').events.emit('hud:refresh');
    }

    if (this.pendingFromBattle) {
      const event = this.pendingFromBattle;
      this.pendingFromBattle = undefined;
      if (event.victory) {
        this.flashMessage(`Defeated ${event.enemyId}!`);
      } else {
        this.flashMessage('You retreat to safety.');
      }
    }
  }

  update(): void {
    if (!this.player) return;
    this.player.update(this.cursors, this.wasd);
    this.state.player.x = this.player.sprite.x;
    this.state.player.y = this.player.sprite.y;
    this.state.player.direction = this.player.direction;

    if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      this.tryInteract();
    }
    if (Phaser.Input.Keyboard.JustDown(this.inventoryKey)) {
      this.scene.get('UIScene').events.emit('hud:toggle-inventory');
    }
    if (Phaser.Input.Keyboard.JustDown(this.saveKey)) {
      this.saveService.save(this.state.toSaveData());
      this.flashMessage('Saved.');
    }
  }

  private tryInteract(): void {
    const target = this.player.facingPoint(TILE_SIZE * 0.9);
    const npc = this.npcs.find((n) => Phaser.Math.Distance.Between(n.sprite.x, n.sprite.y, target.x, target.y) < TILE_SIZE);
    if (!npc) return;
    this.scene.pause();
    this.scene.launch('DialogueScene', {
      state: this.state,
      dialogueId: npc.dialogueId,
      onClose: () => {
        this.scene.stop('DialogueScene');
        this.scene.resume();
        this.scene.get('UIScene').events.emit('hud:refresh');
      },
    });
  }

  private startBattle(spawn: EnemySpawn): void {
    const entry = this.enemySprites.find((e) => e.spawn.id === spawn.id);
    if (!entry) return;
    entry.sprite.destroy();
    this.enemySprites = this.enemySprites.filter((e) => e.spawn.id !== spawn.id);
    this.scene.pause();
    this.scene.launch('BattleScene', {
      state: this.state,
      enemyDefId: spawn.enemyDefId,
      enemyId: spawn.id,
      onClose: (result: { victory: boolean; fled: boolean }) => {
        this.scene.stop('BattleScene');
        if (result.victory) this.state.defeatedEnemies.add(spawn.id);
        // Push player back a tile so we don't immediately re-overlap on flee
        if (!result.victory && !result.fled) {
          // defeat -> reset state in a soft way: refill HP back to 1 and respawn
          this.state.player.stats.hp = Math.max(1, Math.floor(this.state.player.stats.maxHp / 2));
        }
        this.scene.resume();
        this.scene.get('UIScene').events.emit('hud:refresh');
        if (result.victory) this.flashMessage('Victory!');
        else if (result.fled) this.flashMessage('You fled.');
        else this.flashMessage('You were defeated...');
      },
    });
  }

  private flashMessage(text: string): void {
    const cam = this.cameras.main;
    const msg = this.add
      .text(cam.midPoint.x, cam.midPoint.y - 80, text, {
        fontFamily: 'monospace',
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#000000aa',
        padding: { x: 10, y: 6 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1000);
    this.tweens.add({
      targets: msg,
      alpha: 0,
      duration: 1400,
      delay: 600,
      onComplete: () => msg.destroy(),
    });
  }
}
