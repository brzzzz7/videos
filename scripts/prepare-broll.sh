#!/usr/bin/env bash
# Prepare the inserted clip for the Style reel.
#
#   scripts/prepare-broll.sh <screen-recording.mov> [ffmpeg]
#
# It arrived as a phone screen recording of a TikTok, so the crop is doing real
# work: it removes the status bar, the search field, the engagement column,
# another creator's handle and the comment box, leaving only the picture. The
# window (922x1640 at +89+320) is 9:16 exactly, centred on the face, and lands
# inside the clean area of a 1180x2556 recording.
#
# The audio is dropped, not lowered: the original carries someone else's voice
# and music, and the brief is that his own voice stays clean.
set -euo pipefail

SRC=${1:?usage: prepare-broll.sh <screen-recording.mov> [ffmpeg]}
FFMPEG=${2:-ffmpeg}
OUT="$(dirname "$0")/../public/cut-broll.mp4"

"$FFMPEG" -hide_banner -loglevel error -i "$SRC" -an \
  -vf "crop=922:1640:89:320,scale=1080:1920:flags=lanczos,fps=30" \
  -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -movflags +faststart "$OUT" -y

echo "wrote $OUT"
