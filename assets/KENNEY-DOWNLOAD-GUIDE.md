# Kenney Assets Download Guide

This guide shows how to download and integrate Kenney.nl assets into the Loom platform.

## Step 1: Download Asset Packs

Visit https://kenney.nl/assets and download these packs (all CC0 licensed):

### Required Packs:

1. **Platformer Pack Redux**
   - URL: https://kenney.nl/assets/platformer-pack-redux
   - Contains: Players, enemies, obstacles, tiles
   - Size: ~50MB

2. **Space Shooter Extension**
   - URL: https://kenney.nl/assets/space-shooter-extension
   - Contains: Spaceships, asteroids, bullets, explosions
   - Size: ~30MB

3. **Racing Pack**
   - URL: https://kenney.nl/assets/racing-pack
   - Contains: Vehicles, obstacles, backgrounds
   - Size: ~40MB

4. **UI Pack**
   - URL: https://kenney.nl/assets/ui-pack
   - Contains: Buttons, icons, HUD elements
   - Size: ~20MB

### Optional Packs:

5. **Sci-Fi Sounds**
   - URL: https://kenney.nl/assets/sci-fi-sounds
   - Contains: Laser shots, explosions, UI sounds
   - Size: ~10MB

6. **Racing Sounds**
   - URL: https://kenney.nl/assets/racing-sounds
   - Contains: Engine sounds, crashes
   - Size: ~5MB

## Step 2: Extract Assets

After downloading, extract each ZIP file and organize:

### Platformer Pack Redux:

```bash
# From: platformer-pack-redux/PNG/
# To: assets/sprites/

# Players
cp platformer-pack-redux/PNG/Players/*.png assets/sprites/
# Enemies
cp platformer-pack-redux/PNG/Enemies/*.png assets/sprites/
# Obstacles
cp platformer-pack-redux/PNG/Obstacles/*.png assets/sprites/
# Tiles (for backgrounds)
cp platformer-pack-redux/PNG/Tiles/*.png assets/backgrounds/
```

### Space Shooter Extension:

```bash
# From: space-shooter-extension/PNG/
# To: assets/sprites/

# Ships
cp space-shooter-extension/PNG/Ships/*.png assets/sprites/
# Asteroids
cp space-shooter-extension/PNG/Meteors/*.png assets/sprites/
# Projectiles
cp space-shooter-extension/PNG/Projectiles/*.png assets/sprites/
# Backgrounds
cp space-shooter-extension/Backgrounds/*.png assets/backgrounds/
```

### Racing Pack:

```bash
# From: racing-pack/PNG/
# To: assets/sprites/

# Vehicles
cp racing-pack/PNG/Vehicles/*.png assets/sprites/
# Obstacles
cp racing-pack/PNG/Obstacles/*.png assets/sprites/
# Backgrounds
cp racing-pack/Backgrounds/*.png assets/backgrounds/
```

### UI Pack:

```bash
# From: ui-pack/PNG/
# To: assets/ui/

# Buttons
cp ui-pack/PNG/Buttons/*.png assets/ui/
# Icons
cp ui-pack/PNG/Icons/*.png assets/ui/
```

### Sound Packs:

```bash
# From: sci-fi-sounds/
# To: assets/audio/

# SFX
cp sci-fi-sounds/*.ogg assets/audio/sfx/

# From: racing-sounds/
# To: assets/audio/

# SFX
cp racing-sounds/*.ogg assets/audio/sfx/
```

## Step 3: Rename and Organize

Rename key assets to match our naming convention:

```bash
cd assets/

# Sprites
mv sprites/player*.png sprites/player_default.png
mv sprites/bird*.png sprites/player_bird.png
mv sprites/ship*.png sprites/player_ship.png
mv sprites/car*.png sprites/player_runner.png

# Backgrounds
mv backgrounds/sky*.png backgrounds/sky_blue.png
mv backgrounds/space*.png backgrounds/space_stars.png
mv backgrounds/road*.png backgrounds/ground_grass.png

# UI
mv ui/button*.png ui/button_default.png
```

## Step 4: Update Manifest

After organizing assets, update `asset-manifest.json` with the actual file names and metadata.

```bash
# Run this to auto-generate manifest
pnpm run update-manifest
```

## Step 5: Verify

Run tests to ensure assets are properly integrated:

```bash
pnpm test -- e2e.test.ts
```

## Alternative: Automated Download

If you have `wget` and `unzip` installed, you can use the automated download script:

```bash
./assets/download-kenney-assets.sh
```

This will:
1. Download all required packs
2. Extract to temporary directory
3. Copy to correct locations
4. Clean up temporary files

## Notes

- All Kenney assets are CC0 (Public Domain) - free to use
- Keep original file sizes (don't resize)
- PNG format preferred over JPG for transparency support
- OGG format preferred for audio (better compression)
- Total download size: ~150MB
- Total extracted size: ~200MB

## Troubleshooting

