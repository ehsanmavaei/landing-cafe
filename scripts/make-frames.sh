#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/public/frames-mobile"
mkdir -p "$OUT"

INPUT="${1:-input.mp4}"

if [[ ! -f "$INPUT" ]]; then
  echo "Usage: ./scripts/make-frames.sh [path/to/input.mp4]"
  echo "Place your video at ./input.mp4 or pass a path."
  exit 1
fi

ffmpeg -y -i "$INPUT" \
  -vf "fps=24,scale=1280:-1" \
  -c:v libwebp -quality 75 \
  "$OUT/f_%04d.webp"

echo "Portrait frames written to public/frames-mobile (f_0001.webp …)."
echo "For landscape desktop, re-run with OUT=public/frames-desktop and a 16:9 source crop if needed."
