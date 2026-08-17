#!/usr/bin/env bash
# Turn the two camera originals into the render-ready assets in public/.
#
#   ./scripts/prepare-assets.sh <talking-head.mp4> <barbershop.mov> [ffmpeg]
#
# talk.mp4    1080x1920 h264, loudness-normalised speech
# barber.mp4  1080x1920 h264, rotation applied and HLG/BT.2020 tone-mapped to SDR
# voice.m4a   speech only, so the jump cuts can trim video and audio in lockstep
# room.m4a    barbershop ambience for the end card
# music.m4a   the synthesised beat (see scripts/music.py)
# whoosh/impact.m4a  transition sound design (see scripts/sfx.py)
set -euo pipefail

TALK_SRC=${1:?usage: prepare-assets.sh <talking-head> <barbershop> [ffmpeg]}
BARBER_SRC=${2:?usage: prepare-assets.sh <talking-head> <barbershop> [ffmpeg]}
FFMPEG=${3:-ffmpeg}
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/public"

mkdir -p "$OUT"

echo "→ talk.mp4"
"$FFMPEG" -hide_banner -loglevel warning -i "$TALK_SRC" \
  -map 0:v:0 -map 0:a:0 \
  -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,format=yuv420p,fps=30" \
  -c:v libx264 -preset medium -crf 20 -profile:v high -level 4.1 -pix_fmt yuv420p -g 30 \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11" -c:a aac -b:a 160k -ar 48000 \
  -movflags +faststart "$OUT/talk.mp4" -y

echo "→ barber.mp4 (tone-map HLG/BT.2020 → BT.709)"
"$FFMPEG" -hide_banner -loglevel warning -i "$BARBER_SRC" \
  -map 0:v:0 -map 0:a:0 \
  -vf "zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30" \
  -c:v libx264 -preset medium -crf 20 -profile:v high -level 4.1 -pix_fmt yuv420p -g 30 \
  -c:a aac -b:a 128k -ar 48000 -movflags +faststart "$OUT/barber.mp4" -y

echo "→ voice.m4a"
"$FFMPEG" -hide_banner -loglevel error -i "$OUT/talk.mp4" -vn \
  -c:a aac -b:a 160k -ar 48000 -movflags +faststart "$OUT/voice.m4a" -y

echo "→ room.m4a"
"$FFMPEG" -hide_banner -loglevel error -i "$OUT/barber.mp4" -vn \
  -af "highpass=f=90,loudnorm=I=-20:TP=-3:LRA=11" \
  -c:a aac -b:a 128k -ar 48000 -movflags +faststart "$OUT/room.m4a" -y

echo "→ music.m4a"
python3 "$ROOT/scripts/music.py" 62 "$OUT/beat.wav"
"$FFMPEG" -hide_banner -loglevel error -i "$OUT/beat.wav" \
  -c:a aac -b:a 192k -ar 48000 -movflags +faststart "$OUT/music.m4a" -y
rm -f "$OUT/beat.wav"

echo "→ whoosh.m4a + impact.m4a"
python3 "$ROOT/scripts/sfx.py" "$OUT"
for sfx in whoosh impact; do
  "$FFMPEG" -hide_banner -loglevel error -i "$OUT/$sfx.wav" \
    -c:a aac -b:a 160k -ar 48000 -movflags +faststart "$OUT/$sfx.m4a" -y
  rm -f "$OUT/$sfx.wav"
done

echo "→ src/data/spans.json"
python3 "$ROOT/scripts/build_spans.py" "$FFMPEG"

echo "done."
