import Phaser from 'phaser';
import { generateTextures } from './textures';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create(): void {
    generateTextures(this);
    // Launch the touch overlay so it sits on top of every later scene
    this.scene.launch('TouchScene');
    this.scene.bringToTop('TouchScene');
    this.scene.start('TitleScene');
  }
}
