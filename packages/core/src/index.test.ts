import type { GameSpec, Entity, Component } from '../src';

describe('@loom/core types', () => {
  it('should define a valid GameSpec', () => {
    const gameSpec: GameSpec = {
      meta: {
        title: 'Test Game',
        genre: 'runner',
        camera: 'side',
        dimension: '2D',
        version: '1.0.0'
      },
      settings: {
        gravity: 980,
        backgroundColor: '#000000',
        worldWidth: 1920,
        worldHeight: 1080
      },
      scene: {
        type: 'single',
        cameraFollow: 'player'
      },
      entities: [],
      systems: ['physics', 'collision', 'input'],
      mechanics: ['jump'],
      scoring: {
        type: 'distance',
        increment: 1
      },
      ui: {
        hud: ['score'],
        startScreen: true,
        gameOverScreen: true
      },
      assets: [],
      extensions: {}
    };

    expect(gameSpec.meta.title).toBe('Test Game');
    expect(gameSpec.settings.gravity).toBe(980);
  });

  it('should define a valid Entity', () => {
    const entity: Entity = {
      id: 'player',
      type: 'player',
      sprite: 'player_ship',
      position: {
        x: 100,
        y: 200
      },
      physics: {
        gravity: true,
        collidable: true
      },
      components: ['jump', 'gravity', 'keyboardInput']
    };

    expect(entity.id).toBe('player');
    expect(entity.components).toContain('jump');
  });

  it('should define a valid Component', () => {
    const component: Component = {
      type: 'jump',
      enabled: true,
      config: {
        force: 320,
        cooldown: 200
      },
      dependencies: ['gravity']
    };

    expect(component.type).toBe('jump');
    expect(component.config.force).toBe(320);
  });
});
