/**
 * Component system types
 *
 * Components are reusable, parameterized behaviors that can be
 * attached to entities to define their functionality.
 */

/**
 * Base component structure
 */
export interface Component {
  type: string;
  enabled: boolean;
  config: Record<string, unknown>;
  events?: ComponentEvents;
  dependencies?: string[];
}

/**
 * Component event bindings
 */
export interface ComponentEvents {
  onStart?: string[];
  onUpdate?: string[];
  onCollision?: string[];
  onDestroy?: string[];
}

/**
 * Movement components
 */

export interface JumpComponent extends Component {
  type: 'jump';
  config: {
    force: number;
    maxCount?: number;
    cooldown?: number;
  };
  dependencies: ['gravity'];
}

export interface RunComponent extends Component {
  type: 'run';
  config: {
    speed: number;
    acceleration?: number;
  };
}

export interface FlyComponent extends Component {
  type: 'fly';
  config: {
    speed: number;
    direction: 'horizontal' | 'vertical' | 'both';
  };
}

export interface DashComponent extends Component {
  type: 'dash';
  config: {
    speed: number;
    duration: number;
    cooldown: number;
  };
}

/**
 * Physics components
 */

export interface GravityComponent extends Component {
  type: 'gravity';
  config: {
    value: number;
  };
}

export interface CollisionComponent extends Component {
  type: 'collision';
  config: {
    with: string[];
    callback?: string;
  };
}

export interface BounceComponent extends Component {
  type: 'bounce';
  config: {
    value: number;
  };
}

/**
 * Combat components
 */

export interface ShootComponent extends Component {
  type: 'shoot';
  config: {
    rate: number;
    projectile: string;
    speed?: number;
    damage?: number;
  };
}

export interface MeleeComponent extends Component {
  type: 'melee';
  config: {
    damage: number;
    range: number;
    cooldown: number;
  };
}

/**
 * Input components
 */

export interface KeyboardInputComponent extends Component {
  type: 'keyboardInput';
  config: {
    [action: string]: string;
  };
}

export interface MouseInputComponent extends Component {
  type: 'mouseInput';
  config: {
    onClick?: boolean;
    onMove?: boolean;
  };
}

export interface TouchInputComponent extends Component {
  type: 'touchInput';
  config: {
    onTap?: boolean;
    onSwipe?: boolean;
  };
}

/**
 * Lifecycle components
 */

export interface HealthComponent extends Component {
  type: 'health';
  config: {
    max: number;
    current?: number;
    regen?: number;
  };
}

export interface DestroyOnCollisionComponent extends Component {
  type: 'destroyOnCollision';
  config: {
    with: string[];
  };
}

export interface TimeToLiveComponent extends Component {
  type: 'timeToLive';
  config: {
    duration: number;
  };
}

/**
 * AI components
 */

export interface PatrolComponent extends Component {
  type: 'patrol';
  config: {
    points: Array<[number, number]>;
    speed: number;
  };
}

export interface FollowTargetComponent extends Component {
  type: 'followTarget';
  config: {
    target: string;
    speed: number;
    range?: number;
  };
}

/**
 * Interaction components
 */

export interface CollectComponent extends Component {
  type: 'collect';
  config: {
    target: string;
    score?: number;
  };
}

/**
 * Component registry - maps component types to their definitions
 */
export type ComponentRegistry = Map<string, ComponentDefinition>;

export interface ComponentDefinition {
  type: string;
  schema: Record<string, unknown>;
  defaultConfig: Record<string, unknown>;
  dependencies: string[];
}
