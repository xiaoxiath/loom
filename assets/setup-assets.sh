#!/bin/bash

# Asset Download Script for Loom Platform
# Downloads placeholder assets from Kenney.nl (CC0 license)

set -e

ASSETS_DIR="$(dirname "$0")"
SPRITES_DIR="$ASSETS_DIR/sprites"
BACKGROUNDS_DIR="$ASSETS_DIR/backgrounds"
AUDIO_DIR="$ASSETS_DIR/audio"
UI_DIR="$ASSETS_DIR/ui"

echo "🎨 Setting up Loom asset directories..."

# Create directories
mkdir -p "$SPRITES_DIR" "$BACKGROUNDS_DIR" "$AUDIO_DIR/sfx" "$AUDIO_DIR/music" "$UI_DIR"

echo "📦 Asset library structure created!"
echo ""
echo "To add actual assets:"
echo ""
echo "1. Kenney Assets (Recommended - CC0 License):"
echo "   Visit: https://kenney.nl/assets"
echo "   Recommended packs:"
echo "   - Platformer Pack (https://kenney.nl/assets/platformer-pack-redux)"
echo "   - Space Shooter (https://kenney.nl/assets/space-shooter-extension)"
echo "   - UI Pack (https://kenney.nl/assets/ui-pack)"
echo ""
echo "2. Extract downloaded assets to appropriate directories"
echo ""
echo "3. Update asset-manifest.json with new asset entries"
echo ""
echo "Current structure:"
tree "$ASSETS_DIR" -L 2 2>/dev/null || find "$ASSETS_DIR" -type d | head -20

echo ""
echo "✅ Done! Asset directories ready."
