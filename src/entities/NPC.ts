import Phaser from 'phaser';
import { TILE_SIZE } from '../scenes/textures';

export class NPC {
  sprite: Phaser.Physics.Arcade.Sprite;

  constructor(
    scene: Phaser.Scene,
    public id: string,
    x: number,
    y: number,
    texture: string,
    public dialogueId: string,
    public displayName: string,
  ) {
    this.sprite = scene.physics.add.sprite(x, y, texture);
    this.sprite.setSize(TILE_SIZE - 8, TILE_SIZE - 4);
    this.sprite.setOffset(4, 4);
    this.sprite.setImmovable(true);
    (this.sprite.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    (this.sprite.body as Phaser.Physics.Arcade.Body).moves = false;
  }
}
