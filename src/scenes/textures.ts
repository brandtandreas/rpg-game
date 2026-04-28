import Phaser from 'phaser';

export const TILE_SIZE = 32;

/**
 * Generate all procedural placeholder textures used by the game. Called once
 * from BootScene so every later scene can reference them by key.
 */
export function generateTextures(scene: Phaser.Scene): void {
  const g = scene.add.graphics({ x: 0, y: 0 });
  g.setVisible(false);

  // --- tiles ---
  drawTile(g, 0x4a8b3a, 0x3d7530); // grass
  g.generateTexture('tile_grass', TILE_SIZE, TILE_SIZE);
  g.clear();

  drawTile(g, 0x8b6b3a, 0x6e5430); // path
  g.generateTexture('tile_path', TILE_SIZE, TILE_SIZE);
  g.clear();

  drawTile(g, 0x2c5fa8, 0x1f4885); // water
  g.generateTexture('tile_water', TILE_SIZE, TILE_SIZE);
  g.clear();

  drawTree(g);
  g.generateTexture('tile_tree', TILE_SIZE, TILE_SIZE);
  g.clear();

  drawRock(g);
  g.generateTexture('tile_rock', TILE_SIZE, TILE_SIZE);
  g.clear();

  // --- characters ---
  drawCharacter(g, 0xe8d59e, 0x4a3a8b); // hero: tan + purple
  g.generateTexture('player', TILE_SIZE, TILE_SIZE);
  g.clear();

  drawCharacter(g, 0xd4a574, 0x6b4a2a); // npc: tan + brown
  g.generateTexture('npc_elder', TILE_SIZE, TILE_SIZE);
  g.clear();

  drawSlime(g);
  g.generateTexture('enemy_slime', TILE_SIZE, TILE_SIZE);
  g.clear();

  g.destroy();
}

function drawTile(g: Phaser.GameObjects.Graphics, base: number, accent: number): void {
  g.fillStyle(base, 1);
  g.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
  g.fillStyle(accent, 1);
  // scattered specks for texture
  for (let i = 0; i < 6; i++) {
    const x = (i * 7 + 3) % TILE_SIZE;
    const y = (i * 11 + 5) % TILE_SIZE;
    g.fillRect(x, y, 2, 2);
  }
  g.lineStyle(1, 0x000000, 0.1);
  g.strokeRect(0, 0, TILE_SIZE, TILE_SIZE);
}

function drawTree(g: Phaser.GameObjects.Graphics): void {
  g.fillStyle(0x4a8b3a, 1);
  g.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
  g.fillStyle(0x5a3a1a, 1);
  g.fillRect(13, 22, 6, 8);
  g.fillStyle(0x2d5a20, 1);
  g.fillCircle(16, 14, 12);
  g.fillStyle(0x3d7530, 1);
  g.fillCircle(13, 12, 5);
  g.fillCircle(20, 13, 4);
}

function drawRock(g: Phaser.GameObjects.Graphics): void {
  g.fillStyle(0x4a8b3a, 1);
  g.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
  g.fillStyle(0x707070, 1);
  g.fillCircle(16, 18, 10);
  g.fillStyle(0x909090, 1);
  g.fillCircle(13, 15, 4);
}

function drawCharacter(g: Phaser.GameObjects.Graphics, skin: number, body: number): void {
  // body
  g.fillStyle(body, 1);
  g.fillRect(8, 14, 16, 14);
  // head
  g.fillStyle(skin, 1);
  g.fillRect(10, 4, 12, 12);
  // eyes
  g.fillStyle(0x000000, 1);
  g.fillRect(13, 9, 2, 2);
  g.fillRect(17, 9, 2, 2);
  // feet
  g.fillStyle(0x2a1a0a, 1);
  g.fillRect(9, 27, 5, 4);
  g.fillRect(18, 27, 5, 4);
}

function drawSlime(g: Phaser.GameObjects.Graphics): void {
  g.fillStyle(0x55c450, 1);
  g.fillCircle(16, 20, 11);
  g.fillRect(5, 20, 22, 10);
  g.fillStyle(0x88e07f, 1);
  g.fillCircle(13, 17, 3);
  g.fillStyle(0x000000, 1);
  g.fillRect(11, 19, 2, 2);
  g.fillRect(19, 19, 2, 2);
}
