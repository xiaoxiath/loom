#!/bin/bash

# Generate SVG Placeholder Assets
# Creates simple colored rectangles as placeholder assets

ASSETS_DIR="$(dirname "$0")"
SPRITES_DIR="$ASSETS_DIR/sprites"
BACKGROUNDS_DIR="$ASSETS_DIR/backgrounds"
UI_DIR="$ASSETS_DIR/ui"

echo "🎨 Generating SVG placeholder assets..."

mkdir -p "$SPRITES_DIR" "$BACKGROUNDS_DIR" "$UI_DIR"

# Sprites
cat > "$SPRITES_DIR/player_default.svg" << 'EOF'
<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" fill="#4CAF50"/>
  <text x="16" y="20" text-anchor="middle" fill="white" font-size="8">PLAYER</text>
</svg>
EOF

cat > "$SPRITES_DIR/player_bird.svg" << 'EOF'
<svg width="34" height="24" xmlns="http://www.w3.org/2000/svg">
  <rect width="34" height="24" fill="#FFC107"/>
  <text x="17" y="16" text-anchor="middle" fill="black" font-size="8">BIRD</text>
</svg>
EOF

cat > "$SPRITES_DIR/player_ship.svg" << 'EOF'
<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" fill="#2196F3"/>
  <text x="16" y="20" text-anchor="middle" fill="white" font-size="8">SHIP</text>
</svg>
EOF

cat > "$SPRITES_DIR/player_runner.svg" << 'EOF'
<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" fill="#9C27B0"/>
  <text x="16" y="20" text-anchor="middle" fill="white" font-size="6">RUNNER</text>
</svg>
EOF

cat > "$SPRITES_DIR/enemy_default.svg" << 'EOF'
<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" fill="#F44336"/>
  <text x="16" y="20" text-anchor="middle" fill="white" font-size="7">ENEMY</text>
</svg>
EOF

cat > "$SPRITES_DIR/obstacle_pipe.svg" << 'EOF'
<svg width="52" height="320" xmlns="http://www.w3.org/2000/svg">
  <rect width="52" height="320" fill="#8BC34A"/>
  <text x="26" y="160" text-anchor="middle" fill="white" font-size="10" transform="rotate(90 26 160)">PIPE</text>
</svg>
EOF

cat > "$SPRITES_DIR/obstacle_asteroid.svg" << 'EOF'
<svg width="48" height="48" xmlns="http://www.w3.org/2000/svg">
  <circle cx="24" cy="24" r="24" fill="#9E9E9E"/>
  <text x="24" y="28" text-anchor="middle" fill="white" font-size="8">ROCK</text>
</svg>
EOF

cat > "$SPRITES_DIR/obstacle_spike.svg" << 'EOF'
<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
  <polygon points="16,0 32,32 0,32" fill="#FF5722"/>
  <text x="16" y="24" text-anchor="middle" fill="white" font-size="8">SPIKE</text>
</svg>
EOF

# Backgrounds
cat > "$BACKGROUNDS_DIR/sky_blue.svg" << 'EOF'
<svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#87CEEB"/>
      <stop offset="100%" style="stop-color:#E0F6FF"/>
    </linearGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#sky)"/>
</svg>
EOF

cat > "$BACKGROUNDS_DIR/space_stars.svg" << 'EOF'
<svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
  <rect width="1920" height="1080" fill="#0a0e27"/>
  <circle cx="100" cy="100" r="2" fill="white"/>
  <circle cx="300" cy="200" r="1" fill="white"/>
  <circle cx="500" cy="150" r="2" fill="white"/>
  <circle cx="700" cy="300" r="1" fill="white"/>
  <circle cx="900" cy="50" r="2" fill="white"/>
  <circle cx="1100" cy="250" r="1" fill="white"/>
  <circle cx="1300" cy="100" r="2" fill="white"/>
  <circle cx="1500" cy="350" r="1" fill="white"/>
  <circle cx="1700" cy="200" r="2" fill="white"/>
  <circle cx="200" cy="400" r="1" fill="white"/>
  <circle cx="400" cy="500" r="2" fill="white"/>
  <circle cx="600" cy="600" r="1" fill="white"/>
  <circle cx="800" cy="700" r="2" fill="white"/>
  <circle cx="1000" cy="800" r="1" fill="white"/>
  <circle cx="1200" cy="900" r="2" fill="white"/>
</svg>
EOF

cat > "$BACKGROUNDS_DIR/ground_grass.svg" << 'EOF'
<svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
  <rect width="1920" height="900" fill="#87CEEB"/>
  <rect y="900" width="1920" height="180" fill="#7CB342"/>
  <rect y="900" width="1920" height="10" fill="#558B2F"/>
</svg>
EOF

# UI
cat > "$UI_DIR/button_default.svg" << 'EOF'
<svg width="200" height="50" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="50" rx="5" fill="#3F51B5"/>
  <text x="100" y="32" text-anchor="middle" fill="white" font-size="14" font-family="Arial">BUTTON</text>
</svg>
EOF

cat > "$UI_DIR/icon_heart.svg" << 'EOF'
<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
  <path d="M16 28 L4 16 Q0 12 0 8 Q0 2 6 2 Q10 2 16 8 Q22 2 26 2 Q32 2 32 8 Q32 12 28 16 Z" fill="#E91E63"/>
</svg>
EOF

cat > "$UI_DIR/icon_coin.svg" << 'EOF'
<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
  <circle cx="16" cy="16" r="14" fill="#FFD700" stroke="#FFA000" stroke-width="2"/>
  <text x="16" y="21" text-anchor="middle" fill="#FFA000" font-size="14" font-weight="bold">$</text>
</svg>
EOF

echo "✅ Generated placeholder assets:"
echo "  Sprites:     8 files"
echo "  Backgrounds: 3 files"
echo "  UI:          3 files"
echo ""
echo "Total: 14 SVG placeholder assets"
echo ""
echo "These are simple placeholders for testing."
echo "To use real assets, run: ./download-kenney-assets.sh"
