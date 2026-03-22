# Loom Asset Library

This directory contains game assets for the Loom game generation platform.

## Directory Structure

```
assets/
├── sprites/          # Character and object sprites
│   ├── player/       # Player sprites
│   ├── enemies/      # Enemy sprites
│   ├── obstacles/    # Obstacle sprites
│   └── items/        # Collectibles and items
├── backgrounds/      # Background images
│   ├── sky/          # Sky backgrounds
│   ├── space/        # Space backgrounds
│   └── ground/       # Ground/platforms
├── audio/            # Sound effects and music
│   ├── sfx/          # Sound effects
│   └── music/        # Background music
└── ui/               # UI elements
    ├── buttons/      # Button sprites
    └── icons/        # Icons and HUD elements
```

## Asset Sources

### Kenney Assets (Primary)
- Website: https://kenney.nl/assets
- License: CC0 (Public Domain)
- Categories: Platformer, Shooter, Racing

### Placeholder Assets
For rapid prototyping, we use colored rectangles and basic shapes.
These are generated programmatically in the Asset Resolver.

## Usage

Assets are automatically resolved by the `@loom/asset-resolver` package based on GameSpec requirements.

## Adding New Assets

1. Download assets from Kenney (or create your own)
2. Place in appropriate directory
3. Update `asset-manifest.json`
4. Run `pnpm run update-assets` to regenerate cache
