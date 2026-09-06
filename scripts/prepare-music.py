#!/usr/bin/env python3
"""Condition a supplied music track for public/ and the bed library.

    python3 scripts/prepare-music.py <in> <name> <start> <seconds> [ffmpeg]

The synthesised beds sit between -12 and -17 LUFS and the reels' volume ramps
are written against that. A commercial master arrives around -11 LUFS and would
sit far louder than the ramp assumes, so the excerpt is matched to the quietest
bed in the library (-17 LUFS, `music-suspense`) rather than left as delivered.

It also fades both ends: a song cut mid-bar starts and stops with a click
otherwise, and the tail has to get out of the way of the last caption.
"""

import os
import subprocess
import sys

import numpy as np

SRC = sys.argv[1] if len(sys.argv) > 1 else None
NAME = sys.argv[2] if len(sys.argv) > 2 else None
START = float(sys.argv[3]) if len(sys.argv) > 3 else 0.0
LENGTH = float(sys.argv[4]) if len(sys.argv) > 4 else 40.0
FFMPEG = sys.argv[5] if len(sys.argv) > 5 else "ffmpeg"

SR = 48000
TARGET_LUFS = -17.0     # the level the reels' ramps are written against
FADE_IN = 0.35
FADE_OUT = 1.4

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", f"{NAME}.m4a")


def decode():
    raw = subprocess.run(
        [FFMPEG, "-hide_banner", "-loglevel", "error", "-ss", f"{START}",
         "-t", f"{LENGTH}", "-i", SRC,
         "-ac", "2", "-ar", str(SR), "-c:a", "pcm_f32le", "-f", "f32le", "-"],
        capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64).reshape(-1, 2)


def lufs(path):
    err = subprocess.run(
        [FFMPEG, "-hide_banner", "-i", path, "-af", "ebur128=framelog=quiet",
         "-f", "null", "-"], capture_output=True, text=True).stderr
    return float(err.split("I:")[1].split("LUFS")[0])


def main():
    if not SRC or not NAME:
        sys.exit("usage: prepare-music.py <in> <name> <start> <seconds> [ffmpeg]")
    x = decode()

    n_in = int(FADE_IN * SR)
    n_out = int(FADE_OUT * SR)
    x[:n_in] *= np.linspace(0, 1, n_in)[:, None]
    x[len(x) - n_out:] *= np.linspace(1, 0, n_out)[:, None]

    # write once to measure, scale, write again — ebur128 is the only honest
    # way to compare against the beds already in the library
    tmp = os.path.join(ROOT, "public", f".{NAME}.tmp.m4a")
    def write(data, path):
        subprocess.run(
            [FFMPEG, "-hide_banner", "-loglevel", "error",
             "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-",
             "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", path, "-y"],
            input=np.clip(data, -1, 1).astype(np.float32).tobytes(), check=True)

    write(x, tmp)
    measured = lufs(tmp)
    x *= 10 ** ((TARGET_LUFS - measured) / 20)
    write(x, OUT)
    os.remove(tmp)

    final = lufs(OUT)
    back = subprocess.run(
        [FFMPEG, "-hide_banner", "-loglevel", "error", "-i", OUT,
         "-ac", "2", "-ar", str(SR), "-c:a", "pcm_f32le", "-f", "f32le", "-"],
        capture_output=True, check=True).stdout
    out = np.frombuffer(back, dtype=np.float32)
    over = int((np.abs(out) >= 0.999).sum())
    print(f"  {NAME}: {START:.1f}s +{LENGTH:.1f}s  {measured:.1f} -> {final:.1f} LUFS  "
          f"peak {np.abs(out).max():.3f}  clipped {over}  -> public/{NAME}.m4a")
    if over:
        sys.exit(f"{NAME} clips after encoding")


main()
