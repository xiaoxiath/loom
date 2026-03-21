/**
 * Unit tests for Jump Adapter
 */

import { jumpAdapter } from './jump';

describe('jumpAdapter', () => {
  it('should have correct metadata', () => {
    expect(jumpAdapter.componentType).toBe('jump');
    expect(jumpAdapter.engine).toBe('phaser');
    expect(jumpAdapter.version).toBe('1.0.0');
    expect(jumpAdapter.dependencies).toContain('gravity');
    expect(jumpAdapter.dependencies).toContain('keyboardInput');
  });

  it('should define onCreate lifecycle hook', () => {
    expect(jumpAdapter.onCreate).toBeDefined();
  });

  it('should define onUpdate lifecycle hook', () => {
    expect(jumpAdapter.onUpdate).toBeDefined();
  });

  // Note: Full integration tests would require mocking Phaser
  // These are basic structure tests
});
