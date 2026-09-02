#!/usr/bin/env bash
# Exports all raster icon sizes from icon-source.svg.
# Requires: rsvg-convert (brew install librsvg) OR Inkscape
#
# Usage: bash export-icons.sh

set -e
cd "$(dirname "$0")"

SRC="AppIcon.appiconset/icon-source.svg"

export_png() {
  local size=$1
  local out=$2
  if command -v rsvg-convert &>/dev/null; then
    rsvg-convert -w "$size" -h "$size" "$SRC" -o "$out"
  elif command -v inkscape &>/dev/null; then
    inkscape "$SRC" -w "$size" -h "$size" -o "$out"
  else
    echo "Install librsvg (brew install librsvg) or Inkscape to export PNGs."
    exit 1
  fi
  echo "  → $out"
}

echo "Exporting app icon sizes..."
export_png 16   "AppIcon.appiconset/icon-16.png"
export_png 32   "AppIcon.appiconset/icon-32.png"
export_png 64   "AppIcon.appiconset/icon-64.png"
export_png 128  "AppIcon.appiconset/icon-128.png"
export_png 256  "AppIcon.appiconset/icon-256.png"
export_png 512  "AppIcon.appiconset/icon-512.png"
export_png 1024 "AppIcon.appiconset/icon-1024.png"

echo "Exporting web icon sizes..."
export_png 32   "icon-32.png"
export_png 180  "icon-180.png"    # apple-touch-icon
export_png 192  "icon-192.png"    # PWA manifest
export_png 512  "icon-512.png"    # PWA manifest large

echo "Exporting OG image..."
if command -v rsvg-convert &>/dev/null; then
  rsvg-convert -w 1200 -h 630 "og-image.svg" -o "og-image.png"
elif command -v inkscape &>/dev/null; then
  inkscape "og-image.svg" -w 1200 -h 630 -o "og-image.png"
fi
echo "  → og-image.png"

echo "Done. Copy AppIcon.appiconset/ into your Xcode project's Assets.xcassets."
