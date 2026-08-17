#!/usr/bin/env python3
"""Synthesise a set of light transition sounds for the split-screen reel.

    python3 scripts/sfx-light.py <out-dir>

Six distinct sounds, so a cue never has to reuse the one before it. All of them
follow the same rules as the music bed: noise is FFT band-limited, nothing is
saturated, every envelope starts and ends at zero. scripts/check-music.py is run
on each one, so a sound that would crackle never reaches the render.

  pop      soft round blip, for a card appearing
  tick     short wooden click, for a small element
  chime    two-partial bell, for a number or a result
  swoosh   gentle air movement, for something sliding in
  marimba  wooden note, for a list item
  lift     short upward glide, for the CTA
"""

import os
import subprocess
import sys
import wave

import numpy as np

SR = 48000
OUT = sys.argv[1] if len(sys.argv) > 1 else "."
rng = np.random.default_rng(21)


def band(x, low=None, high=None, slope=0.14):
    n = len(x)
    spec = np.fft.rfft(x)
    f = np.fft.rfftfreq(n, 1 / SR)
    gain = np.ones_like(f)
    if low:
        w = np.clip((f - low * (1 - slope)) / (low * slope * 2 + 1e-9), 0, 1)
        gain *= 0.5 - 0.5 * np.cos(np.pi * w)
    if high:
        w = np.clip((high * (1 + slope) - f) / (high * slope * 2 + 1e-9), 0, 1)
        gain *= 0.5 - 0.5 * np.cos(np.pi * w)
    return np.fft.irfft(spec * gain, n)


def env(n, attack, release, curve=2.0):
    a = max(2, int(attack * SR))
    r = max(2, min(n - a, int(release * SR)))
    hold = max(0, n - a - r)
    return np.concatenate([
        np.sin(np.linspace(0, np.pi / 2, a)) ** 2,
        np.ones(hold),
        np.linspace(1, 0, r) ** curve,
    ])[:n]


def stereo(mono, spread=0.0):
    if not spread:
        return np.vstack([mono, mono])
    delay = int(spread * SR)
    right = np.concatenate([np.zeros(delay), mono])[: len(mono)]
    return np.vstack([mono, right * 0.96])


def glide(f0, f1, dur, harmonics=(1.0, 0.25, 0.1)):
    n = int(dur * SR)
    t = np.arange(n) / SR
    freq = f0 * (f1 / f0) ** (t / dur)
    phase = 2 * np.pi * np.cumsum(freq) / SR
    out = np.zeros(n)
    for i, amp in enumerate(harmonics, start=1):
        out += amp * np.sin(phase * i)
    return out / sum(harmonics)


def pop():
    n = int(0.13 * SR)
    sig = glide(760, 420, 0.13, (1.0, 0.18))
    return stereo(sig * env(n, 0.006, 0.12, 2.6) * 0.5)


def tick():
    n = int(0.05 * SR)
    sig = band(rng.normal(0, 1, n), low=1800, high=6500)
    sig /= max(1e-9, np.abs(sig).max())
    body = np.sin(2 * np.pi * 1400 * np.arange(n) / SR) * 0.5
    return stereo((sig * 0.7 + body) * env(n, 0.003, 0.045, 3.0) * 0.42)


def chime():
    n = int(0.75 * SR)
    t = np.arange(n) / SR
    sig = (np.sin(2 * np.pi * 1318 * t) * 1.0
           + np.sin(2 * np.pi * 1976 * t) * 0.42
           + np.sin(2 * np.pi * 2637 * t) * 0.16)
    sig /= 1.58
    return stereo(sig * env(n, 0.004, 0.74, 2.8) * 0.36, spread=0.006)


def swoosh():
    n = int(0.42 * SR)
    raw = rng.normal(0, 1, n)
    out = np.zeros(n)
    for k, lo in enumerate((500, 1100, 2400, 5200)):
        seg = band(raw, low=lo, high=lo * 2.6)
        w = np.clip(1 - abs(np.linspace(0, 3, n) - k) / 1.5, 0, 1)
        out += seg * w
    out /= max(1e-9, np.abs(out).max())
    return stereo(out * env(n, 0.05, 0.36, 1.8) * 0.34, spread=0.01)


def marimba():
    n = int(0.4 * SR)
    t = np.arange(n) / SR
    sig = (np.sin(2 * np.pi * 523 * t)
           + 0.3 * np.sin(2 * np.pi * 1046 * t)
           + 0.12 * np.sin(2 * np.pi * 2093 * t))
    sig = band(sig / 1.42, low=180, high=6000)
    return stereo(sig * env(n, 0.004, 0.39, 2.6) * 0.44)


def lift():
    n = int(0.36 * SR)
    sig = glide(320, 900, 0.36, (1.0, 0.3, 0.12))
    air = band(rng.normal(0, 1, n), low=2500, high=9000)
    air /= max(1e-9, np.abs(air).max())
    ramp = np.linspace(0, 1, n) ** 2
    return stereo((sig * 0.75 + air * 0.18 * ramp) * env(n, 0.03, 0.14, 1.6) * 0.4)


SOUNDS = {
    "pop": pop, "tick": tick, "chime": chime,
    "swoosh": swoosh, "marimba": marimba, "lift": lift,
}


def write(name, data):
    data = data / max(1e-9, np.abs(data).max()) * 0.88
    path = os.path.join(OUT, f"{name}.wav")
    with wave.open(path, "w") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((data.T * 32767).astype(np.int16).tobytes())
    return path


root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
checker = os.path.join(root, "scripts", "check-music.py")
failed = []
for name, make in SOUNDS.items():
    path = write(name, make())
    print(f"— {name}")
    result = subprocess.run([sys.executable, checker, path], capture_output=True, text=True)
    for line in result.stdout.strip().splitlines()[1:]:
        print("  " + line.strip())
    if result.returncode:
        failed.append(name)

if failed:
    sys.exit(f"these sounds did not pass the check: {', '.join(failed)}")
