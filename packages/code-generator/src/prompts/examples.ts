/**
 * Few-shot examples for code generation
 */

export const CODEGEN_FEW_SHOT = `## Example

### Input (simplified)
Entities: player (jump, keyboardInput), obstacle (static), coin (pickup)
Collisions: player↔obstacle, player↔coin
Mechanics: jump, collect
Scoring: collect type, increment 10

### Output
\`\`\`typescript
export class MainScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private obstacleGroup!: Phaser.Physics.Arcade.StaticGroup;
  private pickupGroup!: Phaser.Physics.Arcade.Group;
  private score = 0;
  private scoreText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    this.load.image('player_sprite', 'assets/sprites/player_sprite.png');
    this.load.image('obstacle_sprite', 'assets/sprites/obstacle_sprite.png');
    this.load.image('coin_sprite', 'assets/sprites/coin_sprite.png');
  }

  create() {
    // Create groups
    this.obstacleGroup = this.physics.add.staticGroup();
    this.pickupGroup = this.physics.add.group();

    // Create player
    this.player = this.physics.add.sprite(100, 300, 'player_sprite');
    this.player.setCollideWorldBounds(true);

    // Create obstacles
    this.obstacleGroup.create(400, 500, 'obstacle_sprite');

    // Create coins
    this.pickupGroup.create(300, 200, 'coin_sprite');

    // Collisions from EntityGraph
    this.physics.add.collider(this.player, this.obstacleGroup);
    this.physics.add.overlap(
      this.player,
      this.pickupGroup,
      this.handleCollectCoin,
      undefined,
      this
    );

    // UI
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      color: '#fff',
    });

    // Camera
    this.cameras.main.startFollow(this.player);
  }

  update() {
    const cursors = this.input.keyboard?.createCursorKeys();
    const spaceKey = this.input.keyboard?.addKey('SPACE');

    if (spaceKey?.isDown && this.player.body?.touching.down) {
      this.player.setVelocityY(-320);
    }
  }

  private handleCollectCoin(
    player: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    coin: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ) {
    (coin as Phaser.Physics.Arcade.Sprite).disableBody(true, true);
    this.score += 10;
    this.scoreText.setText(\`Score: \${this.score}\`);
  }
}
\`\`\``;
