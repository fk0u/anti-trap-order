#!/bin/bash
# Voice-over sementara dengan suara macOS "Damayanti" (Bahasa Indonesia), tanpa internet dan tanpa kredit.
# Membaca demo/narasi.json, menulis demo/video/media/vo-01.wav … vo-10.wav (mono 44,1 kHz 16-bit).
#   scripts/voiceover-macos.sh [kecepatan kata/menit, default 165]
set -euo pipefail
cd "$(dirname "$0")/.."
RATE="${1:-165}"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
python3 - "$TMP" <<'PY'
import json, sys
for i, t in enumerate(json.load(open("demo/narasi.json")), 1):
    open(f"{sys.argv[1]}/{i:02d}.txt", "w").write(t)
PY
for f in "$TMP"/*.txt; do
  n="$(basename "$f" .txt)"
  say -v Damayanti -r "$RATE" -f "$f" -o "$TMP/$n.aiff"
  afconvert -f WAVE -d LEI16@44100 -c 1 "$TMP/$n.aiff" "demo/video/media/vo-$n.wav"
  echo "vo-$n.wav $(afinfo "demo/video/media/vo-$n.wav" | awk '/estimated duration/ {printf "%.1f dtk", $3}')"
done
