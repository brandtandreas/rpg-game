import Phaser from 'phaser';
import type { Direction } from '../types';
import { TILE_SIZE } from '../scenes/textures';

const SPEED = 140;

export class Player {
  sprite: Phaser.Physics.Arcade.Sprite;
  direction: Direction = 'down';

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.physics.add.sprite(x, y, 'player');
    this.sprite.setSize(TILE_SIZE - 8, TILE_SIZE - 4);
    this.sprite.setOffset(4, 4);
    this.sprite.setCollideWorldBounds(true);
  }

  update(cursors: Phaser.Types.Input.Keyboard.CursorKeys, wasd: WASDKeys): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    let vx = 0;
    let vy = 0;
    if (cursors.left?.isDown || wasd.A.isDown) vx -= SPEED;
    if (cursors.right?.isDown || wasd.D.isDown) vx += SPEED;
    if (cursors.up?.isDown || wasd.W.isDown) vy -= SPEED;
    if (cursors.down?.isDown || wasd.S.isDown) vy += SPEED;
    if (vx !== 0 && vy !== 0) {
      vx *= Math.SQRT1_2;
      vy *= Math.SQRT1_2;
    }
    body.setVelocity(vx, vy);
    if (vx < 0) this.direction = 'left';
    else if (vx > 0) this.direction = 'right';
    else if (vy < 0) this.direction = 'up';
    else if (vy > 0) this.direction = 'down';
  }

  facingPoint(distance = TILE_SIZE): { x: number; y: number } {
    const { x, y } = this.sprite;
    switch (this.direction) {
      case 'up':
        return { x, y: y - distance };
      case 'down':
        return { x, y: y + distance };
      case 'left':
        return { x: x - distance, y };
      case 'right':
        return { x: x + distance, y };
    }
  }
}

export interface WASDKeys {
  W: Phaser.Input.Keyboard.Key;
  A: Phaser.Input.Keyboard.Key;
  S: Phaser.Input.Keyboard.Key;
  D: Phaser.Input.Keyboard.Key;
}
