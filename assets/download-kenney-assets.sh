#!/bin/bash

# Kenney Assets Automated Download Script
# Downloads and organizes Kenney.nl assets for Loom platform

set -e

ASSETS_DIR="$(dirname "$0")"
TEMP_DIR="$ASSETS_DIR/.temp-kenney"
SPRITES_DIR="$ASSETS_DIR/sprites"
BACKGROUNDS_DIR="$ASSETS_DIR/backgrounds"
AUDIO_DIR="$ASSETS_DIR/audio"
UI_DIR="$ASSETS_DIR/ui"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎨 Loom Asset Downloader${NC}"
echo -e "${BLUE}========================${NC}"
echo ""

# Check for wget or curl
if command -v wget &> /dev/null; then
    DOWNLOAD_CMD="wget"
elif command -v curl &> /dev/null; then
    DOWNLOAD_CMD="curl -O"
else
    echo -e "${YELLOW}Warning: Neither wget nor curl found.${NC}"
    echo "Please install wget or curl to use automated download."
    echo "Alternatively, follow the manual download guide in KENNEY-DOWNLOAD-GUIDE.md"
    exit 1
fi

# Check for unzip
if ! command -v unzip &> /dev/null; then
    echo -e "${YELLOW}Warning: unzip not found.${NC}"
    echo "Please install unzip to extract downloaded assets."
    exit 1
fi

# Create directories
mkdir -p "$TEMP_DIR"
mkdir -p "$SPRITES_DIR" "$BACKGROUNDS_DIR" "$AUDIO_DIR/sfx" "$AUDIO_DIR/music" "$UI_DIR"

# Asset pack URLs
declare -A PACKS=(
    ["platformer"]="https://kenney.nl/content/3-assets/8-platformer-pack-redux/platformer-pack-redux.zip"
    ["spaceshooter"]="https://kenney.nl/content/3-assets/12-space-shooter-extension/space-shooter-extension.zip"
    ["racing"]="https://kenney.nl/content/3-assets/5-racing-pack/racing-pack.zip"
    ["ui"]="https://kenney.nl/content/3-assets/2-ui-pack/ui-pack.zip"
)

# Download function
download_pack() {
    local name=$1
    local url=$2

    echo -e "${BLUE}📦 Downloading $name...${NC}"

    if [ "$DOWNLOAD_CMD" = "wget" ]; then
        wget -q --show-progress "$url" -O "$TEMP_DIR/$name.zip"
    else
        curl -# -L "$url" -o "$TEMP_DIR/$name.zip"
    fi

    echo -e "${GREEN}✓ Downloaded $name${NC}"
}

# Extract and organize
organize_platformer() {
    echo -e "${BLUE}📁 Organizing Platformer Pack...${NC}"

    cd "$TEMP_DIR"
    unzip -q "platformer.zip"

    # Copy sprites
    find . -name "*.png" -path "*/Players/*" -exec cp {} "$SPRITES_DIR/" \;
    find . -name "*.png" -path "*/Enemies/*" -exec cp {} "$SPRITES_DIR/" \;
    find . -name "*.png" -path "*/Obstacles/*" -exec cp {} "$SPRITES_DIR/" \;

    # Copy backgrounds/tiles
    find . -name "*.png" -path "*/Tiles/*" -exec cp {} "$BACKGROUNDS_DIR/" \;

    cd - > /dev/null
    echo -e "${GREEN}✓ Platformer Pack organized${NC}"
}

organize_spaceshooter() {
    echo -e "${BLUE}📁 Organizing Space Shooter Pack...${NC}"

    cd "$TEMP_DIR"
    unzip -q "spaceshooter.zip"

    # Copy sprites
    find . -name "*.png" -path "*/Ships/*" -exec cp {} "$SPRITES_DIR/" \;
    find . -name "*.png" -path "*/Meteors/*" -exec cp {} "$SPRITES_DIR/" \;
    find . -name "*.png" -path "*/Projectiles/*" -exec cp {} "$SPRITES_DIR/" \;

    # Copy backgrounds
    find . -name "*.png" -path "*/Backgrounds/*" -exec cp {} "$BACKGROUNDS_DIR/" \;

    cd - > /dev/null
    echo -e "${GREEN}✓ Space Shooter Pack organized${NC}"
}

organize_racing() {
    echo -e "${BLUE}📁 Organizing Racing Pack...${NC}"

    cd "$TEMP_DIR"
    unzip -q "racing.zip"

    # Copy sprites
    find . -name "*.png" -path "*/Vehicles/*" -exec cp {} "$SPRITES_DIR/" \;
    find . -name "*.png" -path "*/Obstacles/*" -exec cp {} "$SPRITES_DIR/" \;

    # Copy backgrounds
    find . -name "*.png" -path "*/Backgrounds/*" -exec cp {} "$BACKGROUNDS_DIR/" \;

    cd - > /dev/null
    echo -e "${GREEN}✓ Racing Pack organized${NC}"
}

organize_ui() {
    echo -e "${BLUE}📁 Organizing UI Pack...${NC}"

    cd "$TEMP_DIR"
    unzip -q "ui.zip"

    # Copy UI elements
    find . -name "*.png" -path "*/Buttons/*" -exec cp {} "$UI_DIR/" \;
    find . -name "*.png" -path "*/Icons/*" -exec cp {} "$UI_DIR/" \;

    cd - > /dev/null
    echo -e "${GREEN}✓ UI Pack organized${NC}"
}

# Main execution
echo -e "${YELLOW}This will download ~150MB of assets.${NC}"
echo -e "${YELLOW}Continue? (y/n)${NC}"
read -r response

if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo "Download cancelled."
    exit 0
fi

# Download all packs
for pack in "${!PACKS[@]}"; do
    download_pack "$pack" "${PACKS[$pack]}"
done

# Organize all packs
organize_platformer
organize_spaceshooter
organize_racing
organize_ui

# Count assets
SPRITE_COUNT=$(find "$SPRITES_DIR" -name "*.png" | wc -l)
BG_COUNT=$(find "$BACKGROUNDS_DIR" -name "*.png" | wc -l)
UI_COUNT=$(find "$UI_DIR" -name "*.png" | wc -l)

echo ""
echo -e "${GREEN}✅ Download Complete!${NC}"
echo ""
echo "Assets organized:"
echo "  Sprites:     $SPRITE_COUNT files"
echo "  Backgrounds: $BG_COUNT files"
echo "  UI:          $UI_COUNT files"
echo ""

# Cleanup
echo -e "${BLUE}🧹 Cleaning up temporary files...${NC}"
rm -rf "$TEMP_DIR"

echo -e "${GREEN}✨ Done! Assets ready to use.${NC}"
echo ""
echo "Next steps:"
echo "1. Review assets in: $ASSETS_DIR"
echo "2. Update asset-manifest.json if needed"
echo "3. Run: pnpm test -- e2e.test.ts"
