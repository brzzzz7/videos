#!/usr/bin/env python3
"""Condition a one-shot sound effect for public/sfx/.

    python3 scripts/prepare-sfx.py <in.mp3|wav> <name> [ffmpeg]

Library sounds are 48 kHz stereo, tight (no silence either side) and peak at
about -1 dBFS. Recorded samples arrive padded and hot — one of the camera
sounds peaked at exactly 1.000 with two clipped samples, which would clip again
once summed with the voice and the bed — so this trims, resamples, sets the
peak and puts a short fade on the tail so the truncation itself cannot click.

Note on checking: scripts/check-music.py judges *sustained beds*, where energy
above 6 kHz means crackle and a bass-heavy spectrum means hollow. A camera
shutter is legitimately bright and a whoosh is legitimately bass-heavy, so its
spectral verdicts do not apply to one-shots. What still applies to a one-shot is
clipping, which this script removes.
"""

import os
import subprocess
import sys

import numpy as np

SRC = sys.argv[1] if len(sys.argv) > 1 else None
NAME = sys.argv[2] if len(sys.argv) > 2 else None
FFMPEG = sys.argv[3] if len(sys.argv) > 3 else "ffmpeg"

SR = 48000
PEAK = 0.891          # -1 dBFS, matching the synthesised sounds already there
LEAD = 0.004          # silence kept before the onset
TAIL = 0.030          # silence kept after the last audible sample
FADE = 0.012          # fade on the tail, so the cut itself cannot click
FLOOR = 0.005         # onset threshold, relative to the sample's own peak

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "sfx", f"{NAME}.m4a")


def decode():
    raw = subprocess.run(
        [FFMPEG, "-hide_banner", "-loglevel", "error", "-i", SRC,
         "-ac", "2", "-ar", str(SR), "-c:a", "pcm_f32le", "-f", "f32le", "-"],
        capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64).reshape(-1, 2)


def main():
    if not SRC or not NAME:
        sys.exit("usage: prepare-sfx.py <in> <name> [ffmpeg]")
    x = decode()
    mono = np.abs(x).max(1)
    peak_in = mono.max()
    over_in = int((np.abs(x) >= 0.999).sum())

    loud = mono > peak_in * FLOOR
    on = int(np.argmax(loud))
    off = len(mono) - int(np.argmax(loud[::-1]))
    a = max(0, on - int(LEAD * SR))
    b = min(len(x), off + int(TAIL * SR))
    x = x[a:b].copy()

    n = min(int(FADE * SR), len(x))
    x[len(x) - n:] *= np.linspace(1, 0, n)[:, None]

    x *= PEAK / max(np.abs(x).max(), 1e-9)

    pcm = np.clip(x, -1, 1).astype(np.float32).tobytes()
    subprocess.run(
        [FFMPEG, "-hide_banner", "-loglevel", "error",
         "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-",
         "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", OUT, "-y"],
        input=pcm, check=True)

    back = subprocess.run(
        [FFMPEG, "-hide_banner", "-loglevel", "error", "-i", OUT,
         "-ac", "2", "-ar", str(SR), "-c:a", "pcm_f32le", "-f", "f32le", "-"],
        capture_output=True, check=True).stdout
    out = np.frombuffer(back, dtype=np.float32)
    over = int((np.abs(out) >= 0.999).sum())
    print(f"  {NAME:12s} {len(x) / SR:.3f}s  peak {peak_in:.3f}->{np.abs(out).max():.3f}  "
          f"clipped {over_in}->{over}  -> public/sfx/{NAME}.m4a")
    if over:
        sys.exit(f"{NAME} still clips after encoding")


main()
