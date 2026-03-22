#!/bin/bash

# Extract Kenney Assets from Downloads Folder
# Use this after manually downloading asset packs from Kenney.nl

set -e

ASSETS_DIR="$(dirname "$0")"
DOWNLOADS_DIR="$HOME/Downloads"
TEMP_DIR="$ASSETS_DIR/.temp-extract"
SPRITES_DIR="$ASSETS_DIR/sprites"
BACKGROUNDS_DIR="$ASSETS_DIR/backgrounds"
AUDIO_DIR="$ASSETS_DIR/audio"
UI_DIR="$ASSETS_DIR/ui"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}📦 Kenney Asset Extractor${NC}"
echo -e "${BLUE}=========================${NC}"
echo ""

# Create directories
mkdir -p "$TEMP_DIR"
mkdir -p "$SPRITES_DIR" "$BACKGROUNDS_DIR" "$AUDIO_DIR/sfx" "$AUDIO_DIR/music" "$UI_DIR"

# Find ZIP files
echo -e "${BLUE}Searching for Kenney asset packs in Downloads...${NC}"
echo ""

PACKS=(
    "platformer-pack-redux"
    "space-shooter-extension"
    "racing-pack"
    "ui-pack"
)

FOUND_PACKS=()

for pack in "${PACKS[@]}"; do
    # Search for matching ZIP files
    ZIP_FILE=$(find "$DOWNLOADS_DIR" -name "*${pack}*.zip" -type f | head -n 1)

    if [ -n "$ZIP_FILE" ]; then
        echo -e "${GREEN}✓ Found: $(basename "$ZIP_FILE")${NC}"
        FOUND_PACKS+=("$ZIP_FILE")
    else
        echo -e "${YELLOW}✗ Not found: $pack${NC}"
    fi
done

if [ ${#FOUND_PACKS[@]} -eq 0 ]; then
    echo ""
    echo -e "${RED}No Kenney asset packs found in Downloads folder!${NC}"
    echo ""
    echo "Please download from:"
    echo "  • https://kenney.nl/assets/platformer-pack-redux"
    echo "  • https://kenney.nl/assets/space-shooter-extension"
    echo "  • https://kenney.nl/assets/racing-pack"
    echo "  • https://kenney.nl/assets/ui-pack"
    echo ""
    exit 1
fi

echo ""
echo -e "${YELLOW}Found ${#FOUND_PACKS[@]} pack(s). Extract? (y/n)${NC}"
read -r response

if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo "Extraction cancelled."
    exit 0
fi

echo ""
echo -e "${BLUE}Extracting assets...${NC}"
echo ""

# Extract and organize
for ZIP_FILE in "${FOUND_PACKS[@]}"; do
    PACK_NAME=$(basename "$ZIP_FILE" .zip)
    echo -e "${BLUE}Processing: $PACK_NAME${NC}"

    # Extract
    cd "$TEMP_DIR"
    unzip -q "$ZIP_FILE"

    # Organize based on pack type
    if [[ "$PACK_NAME" == *"platformer"* ]]; then
        # Platformer pack
        find . -name "*.png" -path "*Players*" -exec cp {} "$SPRITES_DIR/" \; 2>/dev/null || true
        find . -name "*.png" -path "*Enemies*" -exec cp {} "$SPRITES_DIR/" \; 2>/dev/null || true
        find . -name "*.png" -path "*Obstacles*" -exec cp {} "$SPRITES_DIR/" \; 2>/dev/null || true
        find . -name "*.png" -path "*Tiles*" -exec cp {} "$BACKGROUNDS_DIR/" \; 2>/dev/null || true

    elif [[ "$PACK_NAME" == *"space"* ]] || [[ "$PACK_NAME" == *"shooter"* ]]; then
        # Space shooter pack
        find . -name "*.png" -path "*Ships*" -exec cp {} "$SPRITES_DIR/" \; 2>/dev/null || true
        find . -name "*.png" -path "*Meteors*" -exec cp {} "$SPRITES_DIR/" \; 2>/dev/null || true
        find . -name "*.png" -path "*Projectiles*" -exec cp {} "$SPRITES_DIR/" \; 2>/dev/null || true
        find . -name "*.png" -path "*Backgrounds*" -exec cp {} "$BACKGROUNDS_DIR/" \; 2>/dev/null || true

    elif [[ "$PACK_NAME" == *"racing"* ]]; then
        # Racing pack
        find . -name "*.png" -path "*Vehicles*" -exec cp {} "$SPRITES_DIR/" \; 2>/dev/null || true
        find . -name "*.png" -path "*Obstacles*" -exec cp {} "$SPRITES_DIR/" \; 2>/dev/null || true
        find . -name "*.png" -path "*Backgrounds*" -exec cp {} "$BACKGROUNDS_DIR/" \; 2>/dev/null || true

    elif [[ "$PACK_NAME" == *"ui"* ]]; then
        # UI pack
        find . -name "*.png" -path "*Buttons*" -exec cp {} "$UI_DIR/" \; 2>/dev/null || true
        find . -name "*.png" -path "*Icons*" -exec cp {} "$UI_DIR/" \; 2>/dev/null || true
    fi

    # Look for audio files
    find . -name "*.ogg" -o -name "*.mp3" -o -name "*.wav" | while read -r audio_file; do
        if [[ "$audio_file" == *"music"* ]] || [[ "$audio_file" == *"Music"* ]]; then
            cp "$audio_file" "$AUDIO_DIR/music/" 2>/dev/null || true
        else
            cp "$audio_file" "$AUDIO_DIR/sfx/" 2>/dev/null || true
        fi
    done

    # Clean up
    rm -rf "$TEMP_DIR"/*
    cd - > /dev/null

    echo -e "${GREEN}✓ Extracted $PACK_NAME${NC}"
done

# Count extracted assets
SPRITE_COUNT=$(find "$SPRITES_DIR" -name "*.png" | wc -l | tr -d ' ')
BG_COUNT=$(find "$BACKGROUNDS_DIR" -name "*.png" | wc -l | tr -d ' ')
UI_COUNT=$(find "$UI_DIR" -name "*.png" | wc -l | tr -d ' ')
SFX_COUNT=$(find "$AUDIO_DIR/sfx" -type f | wc -l | tr -d ' ')
MUSIC_COUNT=$(find "$AUDIO_DIR/music" -type f | wc -l | tr -d ' ')

echo ""
echo -e "${GREEN}✅ Extraction Complete!${NC}"
echo ""
echo "Assets extracted:"
echo "  Sprites:     $SPRITE_COUNT files"
echo "  Backgrounds: $BG_COUNT files"
echo "  UI:          $UI_COUNT files"
echo "  SFX:         $SFX_COUNT files"
echo "  Music:       $MUSIC_COUNT files"
echo ""

# Cleanup
rm -rf "$TEMP_DIR"

echo -e "${GREEN}✨ Done! High-quality assets ready to use.${NC}"
echo ""
echo "Next steps:"
echo "1. Update asset-manifest.json with new assets"
echo "2. Run: pnpm test -- e2e.test.ts"
echo "3. Enjoy your high-quality game assets! 🎮"
