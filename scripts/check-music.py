#!/usr/bin/env python3
"""Verify a generated music bed is clean before it goes near a render.

    python3 scripts/check-music.py <file.wav>

Three failure modes, each with a metric that actually separates them:

* **Clicks / crackle** — an isolated sample far off the local trend. Raw
  sample-to-sample jumps do not work as a test: legitimate content at 10 kHz
  swings 0.12 between samples all by itself. What a click looks like is a
  second-difference outlier, so that is what is measured.
* **Clipping** — samples pinned at full scale.
* **A bed a phone cannot play** — energy shares are A-weighted, because
  unweighted power always looks bass-heavy and says nothing about what is
  audible on a phone speaker.
"""

import sys
import wave

import numpy as np

path = sys.argv[1] if len(sys.argv) > 1 else "beat.wav"

with wave.open(path) as w:
    sr = w.getframerate()
    channels = w.getnchannels()
    data = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16)

x = data.astype(np.float32).reshape(-1, channels) / 32768
mono = x.mean(1)


def a_weight(f):
    """IEC 61672 A-weighting, as a linear gain."""
    f = np.maximum(f, 1e-6)
    f2 = f ** 2
    num = (12194.0 ** 2) * f2 ** 2
    den = ((f2 + 20.6 ** 2)
           * np.sqrt((f2 + 107.7 ** 2) * (f2 + 737.9 ** 2))
           * (f2 + 12194.0 ** 2))
    return 1.2589 * num / den


spec = np.abs(np.fft.rfft(mono))
freq = np.fft.rfftfreq(len(mono), 1 / sr)
weighted = (spec * a_weight(freq)) ** 2
total = weighted.sum()

bands = [(0, 120, "sub"), (120, 500, "bass"), (500, 2000, "mid"),
         (2000, 6000, "high"), (6000, 20000, "air")]
share = {}
for lo, hi, name in bands:
    m = (freq >= lo) & (freq < hi)
    share[name] = 100 * weighted[m].sum() / total

# click detector: |x[n] - (x[n-1]+x[n+1])/2| against the local RMS
mid = (mono[:-2] + mono[2:]) / 2
spike = np.abs(mono[1:-1] - mid)
win = int(0.02 * sr)
pad = np.pad(mono ** 2, (win, win), mode="edge")
local = np.sqrt(np.convolve(pad, np.ones(2 * win + 1) / (2 * win + 1), "valid"))[1:-1]
ratio = spike / np.maximum(local, 1e-4)
clicks = int((ratio > 6).sum())

clipped = int((np.abs(x) >= 0.999).sum())

print(f"{path}  {len(mono) / sr:.2f}s  {sr} Hz  {channels}ch")
print(f"  peak              {np.abs(x).max():.3f}   clipped {clipped}")
print(f"  click outliers    {clicks}  (worst ratio {ratio.max():.1f}x local level)")
print("  A-weighted energy " + "  ".join(f"{k} {v:.0f}%" for k, v in share.items()))

problems = []
if clipped:
    problems.append(f"{clipped} clipped samples")
if clicks > len(mono) / sr * 2:      # a couple per second is transient content
    problems.append(f"{clicks} click-like outliers")
if share["air"] > 12:
    problems.append(
        f"noise-dominated ({share['air']:.0f}% A-weighted above 6 kHz — this is "
        f"what crackle sounds like)")
if share["sub"] > 30:
    problems.append(f"sub-heavy ({share['sub']:.0f}% A-weighted under 120 Hz)")
if share["mid"] + share["high"] < 30:
    problems.append(
        f"hollow ({share['mid'] + share['high']:.0f}% A-weighted in 500–6000 Hz)")

print("  verdict           " + ("OK" if not problems else "PROBLEM: " + "; ".join(problems)))
sys.exit(1 if problems else 0)
