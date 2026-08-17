#!/usr/bin/env bash
# Build every asset the "Morning" composition needs from the 4K camera original.
#
#   ./scripts/prepare-morning.sh <A001_xxx.mp4> [ffmpeg]
#
# morning-voice.m4a   the camera mic sat at about -45 dBFS: lift, denoise,
#                     compress, de-ess and normalise to -14 LUFS
# morning-music.m4a   124 bpm bed (scripts/music.py)
# shots/*.mp4         one file per shot, cropped out of the 4K frame at three
#                     framings, with handle frames for the dissolves
set -euo pipefail

SRC=${1:?usage: prepare-morning.sh <source.mp4> [ffmpeg]}
FFMPEG=${2:-ffmpeg}
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/public"

mkdir -p "$OUT"

echo "→ morning-voice.m4a"
"$FFMPEG" -hide_banner -loglevel error -i "$SRC" -vn \
  -af "volume=26dB,highpass=f=95,afftdn=nr=18:nf=-38,acompressor=threshold=-18dB:ratio=3:attack=8:release=180,deesser=i=0.2,loudnorm=I=-14:TP=-1.5:LRA=11" \
  -ac 1 -ar 48000 -c:a aac -b:a 160k -movflags +faststart "$OUT/morning-voice.m4a" -y

echo "→ morning-music.m4a"
python3 "$ROOT/scripts/music.py" 52 "$OUT/morning-beat.wav" 124
"$FFMPEG" -hide_banner -loglevel error -i "$OUT/morning-beat.wav" \
  -c:a aac -b:a 192k -ar 48000 -movflags +faststart "$OUT/morning-music.m4a" -y
rm -f "$OUT/morning-beat.wav"

echo "→ shots/"
python3 "$ROOT/scripts/cut-shots.py" "$SRC" "$FFMPEG"

echo "done. (scripts/presence.py checks whether any shot needs to borrow its picture)"
