/**
 * Enhanced Game Template Generator
 *
 * Generates complete, playable Phaser games with full game loops
 */

import type { GameSpec, EntityGraph, ComponentGraph } from '@loom/core';

export interface EnhancedTemplateOptions {
  gameSpec: GameSpec;
  entityGraph: EntityGraph;
  componentGraph: ComponentGraph;
}

/**
 * Generate enhanced Flappy Bird style game
 */
export function generateEnhancedFlappyGame(options: EnhancedTemplateOptions): string {
  const { gameSpec } = options;

  return `import Phaser from 'phaser';

export class MainScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private obstacleGroup!: Phaser.Physics.Arcade.Group;
  private score = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private gameOver = false;
  private gameStarted = false;
  private startText!: Phaser.GameObjects.Text;
  private instructionText!: Phaser.GameObjects.Text;
  private pipeSpeed = 200;
  private pipeSpawnTimer?: Phaser.Time.TimerEvent;

  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    // Textures will be generated in create()
  }

  create() {
    // Generate textures
    this.generatePlaceholderTexture('bird', 'hsl(57, 70%, 50%)', 32, 32);
    this.generatePlaceholderTexture('pipe', 'hsl(120, 70%, 40%)', 64, 400);

    // Create obstacle group
    this.obstacleGroup = this.physics.add.group();

    // Create player
    this.player = this.physics.add.sprite(100, 300, 'bird');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.2);
    this.player.body!.setAllowGravity(false); // Disable gravity until game starts

    // Setup collisions
    this.physics.add.collider(this.player, this.obstacleGroup, this.hitObstacle, undefined, this);

    // Setup camera
    this.cameras.main.setBackgroundColor('#87CEEB');

    // Create UI
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial',
    });
    this.scoreText.setScrollFactor(0);
    this.scoreText.setDepth(100);

    // Start screen
    this.startText = this.add.text(400, 250, 'Flappy Bird', {
      fontSize: '64px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    });
    this.startText.setOrigin(0.5);
    this.startText.setScrollFactor(0);
    this.startText.setDepth(100);

    this.instructionText = this.add.text(400, 350, 'Press SPACE to Start', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial',
    });
    this.instructionText.setOrigin(0.5);
    this.instructionText.setScrollFactor(0);
    this.instructionText.setDepth(100);

    // Setup keyboard
    if (this.input.keyboard) {
      this.spaceKey = this.input.keyboard.addKey('SPACE');
    }
  }

  update(time: number, delta: number) {
    if (this.gameOver) {
      return;
    }

    // Start game on first space press
    if (!this.gameStarted && this.spaceKey?.isDown) {
      this.startGame();
      return;
    }

    if (!this.gameStarted) {
      return;
    }

    // Jump
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.player.setVelocityY(-350);
    }

    // Update obstacles
    this.obstacleGroup.getChildren().forEach((obstacle: any) => {
      obstacle.x -= this.pipeSpeed * (delta / 1000);

      // Remove off-screen obstacles
      if (obstacle.x < -50) {
        obstacle.destroy();
        this.score += 5;
        this.scoreText.setText('Score: ' + this.score);
      }
    });

    // Check if player falls out of bounds
    if (this.player.y > 600 || this.player.y < 0) {
      this.hitObstacle();
    }
  }

  private startGame() {
    this.gameStarted = true;
    this.player.body!.setAllowGravity(true);
    this.player.setVelocityY(0);

    // Hide start screen
    this.startText.setVisible(false);
    this.instructionText.setVisible(false);

    // Start spawning pipes
    this.spawnPipePair();
    this.pipeSpawnTimer = this.time.addEvent({
      delay: 2000,
      callback: this.spawnPipePair,
      callbackScope: this,
      loop: true,
    });

    // Initial jump
    this.player.setVelocityY(-350);
  }

  private spawnPipePair() {
    if (this.gameOver) return;

    // Random gap position
    const gapPosition = Phaser.Math.Between(150, 450);
    const gapSize = 150;

    // Top pipe
    const topPipe = this.physics.add.sprite(850, gapPosition - gapSize / 2, 'pipe');
    topPipe.setOrigin(0.5, 1);
    topPipe.setImmovable(true);
    topPipe.body!.setAllowGravity(false);
    this.obstacleGroup.add(topPipe);

    // Bottom pipe
    const bottomPipe = this.physics.add.sprite(850, gapPosition + gapSize / 2, 'pipe');
    bottomPipe.setOrigin(0.5, 0);
    bottomPipe.setImmovable(true);
    bottomPipe.body!.setAllowGravity(false);
    this.obstacleGroup.add(bottomPipe);

    // Increase difficulty
    if (this.score > 50) {
      this.pipeSpeed = 250;
    } else if (this.score > 100) {
      this.pipeSpeed = 300;
    }
  }

  private hitObstacle() {
    if (this.gameOver) return;

    this.gameOver = true;
    this.physics.pause();
    this.player.setTint(0xff0000);

    if (this.pipeSpawnTimer) {
      this.pipeSpawnTimer.destroy();
    }

    // Show game over screen
    const gameOverText = this.add.text(400, 250, 'Game Over!', {
      fontSize: '64px',
      color: '#ff0000',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    });
    gameOverText.setOrigin(0.5);
    gameOverText.setScrollFactor(0);
    gameOverText.setDepth(100);

    const restartText = this.add.text(400, 350, 'Press SPACE to Restart', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial',
    });
    restartText.setOrigin(0.5);
    restartText.setScrollFactor(0);
    restartText.setDepth(100);

    // Restart on space
    this.input.keyboard!.once('SPACE', () => {
      this.scene.restart();
    });
  }

  private generatePlaceholderTexture(key: string, color: string, width: number, height: number) {
    const graphics = this.make.graphics({ x: 0, y: 0 });

    // Parse HSL values
    const hslMatch = color.match(/hsl\\((\\d+),\\s*(\\d+)%,\\s*(\\d+)%\\)/);
    const h = parseInt(hslMatch?.[1] ?? '0');
    const s = parseInt(hslMatch?.[2] ?? '70') / 100;
    const l = parseInt(hslMatch?.[3] ?? '50') / 100;

    // Convert HSL to color integer
    const colorInt = Phaser.Display.Color.HSLToColor(h, s, l).color;

    graphics.fillStyle(colorInt);
    graphics.fillRect(0, 0, width, height);
    graphics.generateTexture(key, width, height);
    graphics.destroy();
  }
}
`;
}

/**
 * Check if game spec matches Flappy Bird pattern
 */
export function isFlappyBirdStyle(gameSpec: GameSpec): boolean {
  return (
    gameSpec.meta.genre === 'runner' ||
    (gameSpec.mechanics.includes('jump') && gameSpec.mechanics.includes('avoid'))
  );
}
