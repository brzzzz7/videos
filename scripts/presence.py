#!/usr/bin/env python3
"""Find where the subject is actually in frame, in a static-camera take.

Samples the luminance of the box he occupies (he is lit, the room is not),
splits it in two classes, and prints the continuous in-frame windows plus a
verdict for every shot in scripts/cut-shots.py. Use it before choosing shots, or
after, to see which ones need to borrow their picture from elsewhere.

    python3 scripts/presence.py <source.mp4> [ffmpeg]
"""

import subprocess
import sys

import numpy as np

SRC = sys.argv[1] if len(sys.argv) > 1 else None
FFMPEG = sys.argv[2] if len(sys.argv) > 2 else "ffmpeg"
RATE = 4                    # samples per second
BOX = "crop=1100:1300:480:1200"   # where he sits in the 2160x3840 frame
GRID = (24, 28)


def luminance():
    out = subprocess.run(
        [FFMPEG, "-hide_banner", "-loglevel", "error", "-i", SRC,
         "-vf", f"{BOX},fps={RATE},scale={GRID[0]}:{GRID[1]},format=gray",
         "-f", "rawvideo", "-"],
        capture_output=True, check=True).stdout
    n = GRID[0] * GRID[1]
    frames = len(out) // n
    data = np.frombuffer(out[: frames * n], dtype=np.uint8)
    return np.arange(frames) / RATE, data.reshape(frames, n).mean(1)


def split(values):
    """Otsu-style threshold between the lit and the empty class."""
    best, score = None, -1.0
    for thr in np.linspace(values.min() + 1, values.max() - 1, 300):
        low, high = values[values <= thr], values[values > thr]
        if len(low) < 10 or len(high) < 10:
            continue
        between = len(low) * len(high) * (low.mean() - high.mean()) ** 2
        if between > score:
            best, score = thr, between
    return best


def windows(t, present, min_len=3.0):
    out, start = [], None
    for i, value in enumerate(present):
        if value and start is None:
            start = i
        if not value and start is not None:
            out.append((t[start], t[i - 1]))
            start = None
    if start is not None:
        out.append((t[start], t[-1]))
    return [w for w in out if w[1] - w[0] >= min_len]


def load_shot_list():
    """Read SHOTS out of cut-shots.py (hyphen: not importable by name)."""
    import importlib.util
    import os

    path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cut-shots.py")
    spec = importlib.util.spec_from_file_location("cut_shots", path)
    if spec is None or spec.loader is None:
        return None
    module = importlib.util.module_from_spec(spec)
    # cut-shots.py runs main() on import, so stop it before that
    source = open(path).read().replace("\nmain()\n", "\n")
    exec(compile(source, path, "exec"), module.__dict__)
    return module.__dict__.get("SHOTS")


def main():
    if not SRC:
        sys.exit("usage: presence.py <source.mp4> [ffmpeg]")
    t, lum = luminance()
    thr = split(lum)
    present = lum > thr
    print(f"threshold {thr:.1f} — in frame {100 * present.mean():.0f}% of the take")

    print("continuous in-frame windows:")
    for a, b in windows(t, present):
        print(f"   {a:7.2f} - {b:7.2f}  ({b - a:5.2f}s)")

    shots = load_shot_list()
    if not shots:
        return

    print("shots:")
    for name, _framing, start, end, tail, vstart in shots:
        picture = start if vstart is None else vstart
        a, b = picture, picture + (end - start) + tail
        mask = (t >= a) & (t <= b)
        frac = present[mask].mean() if mask.any() else 0.0
        absent = [round(float(x), 2) for x in t[mask][~present[mask]]]
        verdict = "ok  " if frac > 0.94 else "BORROW"
        print(f"  {verdict} {name:6s} picture {a:7.2f}-{b:7.2f} "
              f"in frame {100 * frac:5.1f}%" +
              (f"  gone at {absent[:6]}" if absent else ""))


main()
