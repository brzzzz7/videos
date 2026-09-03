#!/usr/bin/env python3
"""Synthesise the two transition sounds used by the reel.

    python3 scripts/sfx.py <out-dir>

whoosh.wav  filtered noise sweep for the chapter wipes
impact.wav  sub boom + short crash for the card slams
"""

import os
import sys
import wave

import numpy as np

SR = 48000
rng = np.random.default_rng(11)
OUT = sys.argv[1] if len(sys.argv) > 1 else "."


def lowpass(x, cutoff):
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc = (1 - a) * v + a * acc
        y[i] = acc
    return y


def highpass(x, cutoff):
    return x - lowpass(x, cutoff)


def write(name, stereo):
    stereo = stereo / max(1e-9, np.abs(stereo).max()) * 0.92
    path = os.path.join(OUT, name)
    with wave.open(path, "w") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((stereo.T * 32767).astype(np.int16).tobytes())
    print(f"wrote {path} ({len(stereo[0]) / SR:.2f}s)")


def whoosh(dur=0.5):
    n = int(dur * SR)
    t = np.arange(n) / SR
    noise = rng.normal(0, 1, n)
    out = np.zeros(n)
    # sweep the passband upwards, then let it fall away
    for k, c in enumerate([300, 900, 2400, 6000]):
        w = np.clip(1 - abs(t / dur - k / 3.2) * 3.4, 0, 1)
        out += highpass(noise, c) * w
    env = np.minimum(1, t / 0.02) * np.exp(-((t / dur) ** 2) * 3.2)
    out *= env
    # tiny stereo spread
    left = out
    right = np.concatenate([np.zeros(int(0.004 * SR)), out])[:n] * 0.95
    return np.vstack([left, right])


def impact(dur=0.8):
    n = int(dur * SR)
    t = np.arange(n) / SR
    boom = np.sin(2 * np.pi * (62 * np.exp(-t / 0.16) + 38) * t) * np.exp(-t / 0.16)
    body = np.sin(2 * np.pi * 96 * t) * np.exp(-t / 0.07) * 0.5
    crash = highpass(rng.normal(0, 1, n), 3500) * np.exp(-t / 0.13) * 0.3
    mix = np.tanh((boom + body + crash) * 1.4)
    return np.vstack([mix, mix * 0.98])


write("whoosh.wav", whoosh())
write("impact.wav", impact())
