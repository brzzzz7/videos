#!/usr/bin/env python3
"""Cut the selected shots out of the 4K source, one file per shot.

The source is 2160x3840, so three different framings can be cropped out of it at
or near native 1080x1920 — that is where the reel's cutting variety comes from.

    python3 scripts/cut-shots.py <source.mp4> [ffmpeg]
"""

import json
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = sys.argv[1] if len(sys.argv) > 1 else None
FFMPEG = sys.argv[2] if len(sys.argv) > 2 else "ffmpeg"
OUT = os.path.join(ROOT, "public", "shots")
MANIFEST = os.path.join(ROOT, "src", "data", "morning-shots.json")

# Handles: every shot carries a few extra frames at each end so the reel can
# cross-dissolve without freezing on the last frame.
HANDLE = 8 / 30
SOURCE_END = 178.30

# crop=w:h:x:y against the 2160x3840 source
FRAMING = {
    "mid": "crop=1620:2880:300:300,scale=1080:1920",
    "med": "crop=1350:2400:360:800,scale=1080:1920",
    "close": "crop=1080:1920:440:1020",
}

# id, framing, audio in, audio out, tail held after the audio, picture start
#
# The in/out points sit on real speech, not on the silence around it: heads and
# tails were trimmed against the silence map, so no shot opens or closes on dead
# air (what was left of it read as "the video stalls").
#
# The picture usually comes from the same moment as the voice. Where he leans
# out of frame mid-sentence, the picture is taken from another moment of the
# same take instead (measured with scripts/presence.py) — the voice is
# untouched, only the shot behind it changes.
SHOTS = [
    ("hook", "mid", 23.45, 26.45, 0.0, None),
    ("e1a", "med", 37.25, 41.60, 0.0, 36.00),
    ("e1b", "close", 64.25, 67.20, 0.0, None),
    ("e2a", "mid", 70.35, 74.60, 0.0, None),
    ("e2b", "med", 85.15, 88.75, 0.0, None),
    ("e2c", "close", 92.40, 93.40, 0.0, None),
    ("e3a", "med", 119.65, 125.55, 0.0, 135.00),
    ("e3b", "mid", 127.60, 131.85, 0.0, None),
    ("outro", "close", 150.95, 154.90, 0.0, 148.50),
    ("ctaa", "med", 164.15, 167.80, 0.0, None),
    ("ctab", "mid", 172.80, 175.50, 0.8, 110.00),
]


def main():
    if not SRC:
        sys.exit("usage: cut-shots.py <source.mp4> [ffmpeg]")
    os.makedirs(OUT, exist_ok=True)
    manifest = []
    for name, framing, start, end, tail, vstart in SHOTS:
        path = os.path.join(OUT, f"{name}.mp4")
        picture_start = start if vstart is None else vstart
        cut_in = max(0.0, picture_start - HANDLE)
        cut_out = min(SOURCE_END, picture_start + (end - start) + tail + HANDLE)
        duration = cut_out - cut_in
        subprocess.run(
            [FFMPEG, "-hide_banner", "-loglevel", "error",
             "-ss", f"{cut_in:.3f}", "-t", f"{duration:.3f}", "-i", SRC,
             "-an", "-vf", f"{FRAMING[framing]},fps=30,format=yuv420p",
             "-c:v", "libx264", "-preset", "slow", "-crf", "20",
             "-profile:v", "high", "-level", "4.1", "-g", "30",
             "-movflags", "+faststart", path, "-y"],
            check=True,
        )
        size = os.path.getsize(path) / 1e6
        borrowed = "" if vstart is None else f" picture from {vstart:7.2f}"
        print(f"  {name:6s} {framing:5s} {start:7.2f}-{end:7.2f} "
              f"(+{tail:.1f}s tail)  {size:5.1f} MB{borrowed}")
        manifest.append({
            "id": name,
            "head": round(picture_start - cut_in, 3),
            "file": f"shots/{name}.mp4",
            "framing": framing,
            "start": round(start, 3),
            "end": round(end, 3),
            "tail": round(tail, 3),
            "pictureStart": round(picture_start, 3),
        })

    with open(MANIFEST, "w") as f:
        json.dump({"source": os.path.basename(SRC), "fps": 30,
                   "handleFrames": round(HANDLE * 30), "shots": manifest}, f, indent=2)
    total = sum(s["end"] - s["start"] for s in manifest)
    print(f"{len(manifest)} shots, {total:.2f}s of content -> {MANIFEST}")


main()
