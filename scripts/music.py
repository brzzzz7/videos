"""Generate an original music bed for a reel — no samples, pure synthesis.

    python3 scripts/music.py <seconds> <out.wav> [bpm]

Design rules, learned the hard way after a first version that crackled:

* No raw white noise. Every noise element is band-limited with an FFT
  brick-wall filter, so there are no huge sample-to-sample jumps (those are what
  you hear as crackle).
* No tanh saturation on the mix. Levels are budgeted instead, and a soft-knee
  limiter only catches the last dB.
* Every voice gets a real attack and release (≥ 4 ms / ≥ 25 ms), so nothing
  starts or stops on a discontinuity.
* The weight sits in the 150–2000 Hz range, not in the sub: a phone speaker
  cannot reproduce 50 Hz, and a bed that lives down there reads as "broken".

scripts/check-music.py verifies those properties on the rendered file.
"""

import sys
import wave

import numpy as np

SR = 48000
DUR = float(sys.argv[1]) if len(sys.argv) > 1 else 60.0
OUT = sys.argv[2] if len(sys.argv) > 2 else "beat.wav"
BPM = float(sys.argv[3]) if len(sys.argv) > 3 else 100.0
# "punchy" (default) is the minor, driving bed; "light" is major, softer, for a
# reel that should read as friendly and professional rather than hyped.
MOOD = sys.argv[4] if len(sys.argv) > 4 else "punchy"
LIGHT = MOOD == "light"

BEAT = 60.0 / BPM
BAR = 4 * BEAT
FOUR_ON_FLOOR = BPM >= 115

rng = np.random.default_rng(7)
L = int((DUR + 2) * SR)
left = np.zeros(L)
right = np.zeros(L)


# ----------------------------------------------------------------- primitives
def band(x, low=None, high=None, slope=0.12):
    """Brick-wall-ish band filter with a smooth (cosine) transition."""
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


def env(n, attack, release, hold=None, curve=1.6):
    """Attack / hold / exponential-ish release, always ending at exactly zero."""
    a = max(2, int(attack * SR))
    r = max(2, int(release * SR))
    h = n - a - r if hold is None else int(hold * SR)
    h = max(0, h)
    total = a + h + r
    out = np.concatenate([
        np.sin(np.linspace(0, np.pi / 2, a)) ** 2,
        np.ones(h),
        np.linspace(1, 0, r) ** curve,
    ])
    if total < n:
        out = np.pad(out, (0, n - total))
    return out[:n]


def noise(n, low, high, decay, level):
    """Band-limited noise burst — the only source of 'air' in the bed."""
    raw = rng.normal(0, 1, n)
    shaped = band(raw, low=low, high=high)
    shaped /= max(1e-9, np.abs(shaped).max())
    return shaped * env(n, 0.004, decay, hold=0.0) * level


def tone(freq, n, harmonics=(1.0, 0.32, 0.12), detune=0.0):
    t = np.arange(n) / SR
    out = np.zeros(n)
    for i, amp in enumerate(harmonics, start=1):
        f = freq * i * (1 + detune * (i - 1))
        if f > SR / 2.2:
            break
        out += amp * np.sin(2 * np.pi * f * t)
    return out / sum(harmonics[: max(1, len(harmonics))])


def add(pos, sig, gain=1.0, pan=0.0, bus=None):
    i = int(pos * SR)
    if i < 0:
        sig, i = sig[-i:], 0
    n = min(len(sig), L - i)
    if n <= 0:
        return
    ang = (pan + 1) * np.pi / 4
    left[i:i + n] += sig[:n] * gain * np.cos(ang) * 1.414
    right[i:i + n] += sig[:n] * gain * np.sin(ang) * 1.414
    if bus is not None:
        bus[i:i + n] += sig[:n] * gain


# --------------------------------------------------------------------- voices
def kick(level=0.4):
    n = int(0.34 * SR)
    t = np.arange(n) / SR
    freq = 55 + 62 * np.exp(-t / 0.03)
    body = np.sin(2 * np.pi * np.cumsum(freq) / SR) * env(n, 0.004, 0.28, hold=0.01, curve=2.2)
    click = noise(int(0.05 * SR), 1200, 4200, 0.035, 0.16)
    out = body * 0.9
    out[: len(click)] += click
    return out * level


def snare(level=0.48):
    n = int(0.2 * SR)
    body = (tone(196, n, (1.0, 0.4)) * env(n, 0.003, 0.09, hold=0.0)) * 0.5
    top = noise(n, 900, 6500, 0.11, 0.5)
    return (body + top) * level


def clap(level=0.42):
    n = int(0.26 * SR)
    out = np.zeros(n)
    for k, off in enumerate((0.0, 0.011, 0.023)):
        i = int(off * SR)
        out[i:] += noise(n - i, 1100, 6000, 0.05 if k < 2 else 0.13, 0.6)
    return out / 1.8 * level


def shaker(level=0.40, open_=False):
    n = int((0.16 if open_ else 0.06) * SR)
    return noise(n, 5200, 11000, 0.1 if open_ else 0.03, 0.55) * level


def bass(freq, dur, level=0.30):
    n = int(dur * SR)
    sig = tone(freq, n, (1.0, 0.22, 0.06))
    sig = band(sig, high=520)
    return sig * env(n, 0.008, min(0.14, dur * 0.5), hold=max(0.0, dur - 0.16)) * level


def keys(freq, dur, level=0.26, detune=0.0015):
    """Where the music actually lives: electric piano, or marimba when light."""
    n = int(dur * SR)
    if LIGHT:
        # wooden, quick decay, no beating between voices
        sig = tone(freq, n, (1.0, 0.28, 0.14, 0.05))
        sig = band(sig, low=140, high=5200)
        return sig * env(n, 0.006, dur * 0.85, hold=dur * 0.04, curve=2.4) * level
    sig = tone(freq, n, (1.0, 0.5, 0.22, 0.09), detune=detune)
    sig += 0.4 * tone(freq * (1 + detune * 4), n, (1.0, 0.3))
    sig = band(sig, low=110, high=4200)
    return sig / 1.4 * env(n, 0.016, dur * 0.7, hold=dur * 0.12) * level


def pad(freqs, dur, level=0.15):
    n = int(dur * SR)
    out = np.zeros(n)
    for f in freqs:
        out += tone(f, n, (1.0, 0.3, 0.14))
    out = band(out / len(freqs), low=150, high=2600)
    return out * env(n, 0.35, dur * 0.45, hold=dur * 0.2) * level


def sweep(dur, level=0.12):
    n = int(dur * SR)
    raw = rng.normal(0, 1, n)
    out = np.zeros(n)
    steps = 8
    for k in range(steps):
        lo = 300 * (1.35 ** k)
        seg = band(raw, low=lo, high=min(lo * 2.4, 15000))
        w = np.clip(1 - abs(np.linspace(0, steps - 1, n) - k) / 1.4, 0, 1)
        out += seg * w
    out /= max(1e-9, np.abs(out).max())
    ramp = np.linspace(0, 1, n) ** 2.2
    return out * ramp * env(n, 0.05, 0.12) * level


# ---------------------------------------------------------------- arrangement
NOTE = {n: 440 * 2 ** ((i - 9) / 12) for i, n in enumerate(
    "C C# D D# E F F# G G# A A# B".split())}


def note(name, octave):
    return NOTE[name] * 2 ** (octave - 4)


# punchy: Am - F - C - G (minor).  light: C - G - Am - F (I - V - vi - IV).
if LIGHT:
    PROG = [
        ("C", 3, [note("E", 4), note("G", 4), note("C", 5)]),
        ("G", 2, [note("D", 4), note("G", 4), note("B", 4)]),
        ("A", 2, [note("E", 4), note("A", 4), note("C", 5)]),
        ("F", 2, [note("F", 4), note("A", 4), note("C", 5)]),
    ]
    ARP = [
        [note("C", 5), note("E", 5), note("G", 4), note("E", 5)],
        [note("B", 4), note("D", 5), note("G", 4), note("D", 5)],
        [note("C", 5), note("E", 5), note("A", 4), note("E", 5)],
        [note("C", 5), note("F", 5), note("A", 4), note("F", 5)],
    ]
else:
    PROG = [
        ("A", 2, [note("A", 3), note("C", 4), note("E", 4)]),
        ("F", 2, [note("A", 3), note("C", 4), note("F", 4)]),
        ("C", 3, [note("C", 4), note("E", 4), note("G", 4)]),
        ("G", 2, [note("B", 3), note("D", 4), note("G", 4)]),
    ]
    ARP = [
        [note("A", 4), note("C", 5), note("E", 4), note("C", 5)],
        [note("A", 4), note("C", 5), note("F", 4), note("C", 5)],
        [note("C", 5), note("E", 4), note("G", 4), note("E", 5)],
        [note("B", 4), note("D", 5), note("G", 4), note("D", 5)],
    ]

bars = int(np.ceil(DUR / BAR)) + 1
lead = np.zeros(L)

if not LIGHT:
    add(0.0, sweep(BAR * 0.8), 0.7)

for b in range(bars):
    t0 = b * BAR
    root_name, root_oct, chord = PROG[b % 4]
    root = note(root_name, root_oct)
    playing = t0 > BAR * 0.45
    last = t0 > DUR - BAR * 2

    if LIGHT:
        for off in (0.0, 2.0):
            add(t0 + off * BEAT, kick(0.3))
        add(t0 + 2.5 * BEAT, kick(0.16))
    elif FOUR_ON_FLOOR:
        for k in range(4):
            add(t0 + k * BEAT, kick(0.42 if k == 0 else 0.35))
    else:
        for off in (0.0, 1.5, 2.0, 3.5):
            add(t0 + off * BEAT, kick(0.4))

    if not playing:
        continue

    if LIGHT:
        add(t0 + 1 * BEAT, clap(0.16), pan=-0.06)
        add(t0 + 3 * BEAT, clap(0.16), pan=0.06)
    else:
        add(t0 + 1 * BEAT, snare(), pan=-0.05)
        add(t0 + 3 * BEAT, clap(), pan=0.06)

    for k in range(8):
        p = t0 + k * BEAT / 2
        if LIGHT:
            add(p, shaker(0.2 if k % 2 == 0 else 0.13), pan=0.22)
        else:
            add(p, shaker(0.42 if k % 2 == 0 else 0.27), pan=0.2)
    if FOUR_ON_FLOOR:
        for off in (0.5, 1.5, 2.5, 3.5):
            add(t0 + off * BEAT, shaker(0.17, open_=True), pan=-0.22)
    if b % 4 == 3:
        add(t0 + 3.5 * BEAT, shaker(0.22, open_=True), pan=0.24)

    if LIGHT:
        add(t0, bass(root, BEAT * 1.6), 0.85)
        add(t0 + 2.0 * BEAT, bass(root, BEAT * 1.2), 0.7)
    else:
        add(t0, bass(root, BEAT * 1.35), 1.0)
        add(t0 + 1.5 * BEAT, bass(root, BEAT * 0.45), 0.85)
        add(t0 + 2.0 * BEAT, bass(root * 1.5, BEAT * 0.45), 0.6)
        add(t0 + 3.5 * BEAT, bass(root, BEAT * 0.45), 0.8)

    add(t0, pad(chord, BAR * 1.05, 0.15 if not last else 0.19), 1.0, bus=lead)
    for k, f in enumerate(chord):
        add(t0 + 0.5 * BEAT, keys(f, BEAT * 1.2, 0.26 if not last else 0.32),
            pan=-0.12 + 0.12 * k, bus=lead)
        add(t0 + 2.5 * BEAT, keys(f, BEAT * 0.9, 0.2 if not last else 0.25),
            pan=0.12 - 0.12 * k, bus=lead)

    arp = ARP[b % 4]
    for k in range(8):
        add(t0 + k * BEAT / 2, keys(arp[k % 4], BEAT * 0.42,
                                    0.15 if not last else 0.19),
            pan=0.26 if k % 2 else -0.26, bus=lead)


# a little space, on the melodic bus only
def reverb(x, taps=((0.037, 0.3), (0.061, 0.22), (0.089, 0.15), (0.127, 0.1))):
    out = np.zeros_like(x)
    for d, g in taps:
        i = int(d * SR)
        out[i:] += x[: len(x) - i] * g
    return band(out, high=3800)


wet = reverb(lead) * 0.55
add(0.0, wet, 1.0, pan=-0.34)
add(0.0, wet, 1.0, pan=0.34)

mix = np.vstack([left, right])[:, : int(DUR * SR)]

# soft-knee limiter: only the last dB, no waveshaping of the body
peak = np.abs(mix).max()
if peak > 0.9:
    over = np.clip(np.abs(mix) - 0.9, 0, None)
    mix = np.sign(mix) * (np.minimum(np.abs(mix), 0.9) + over / (1 + over / 0.1) * 0.1)
mix *= 0.86 / max(1e-9, np.abs(mix).max())

fade_in, fade_out = int(0.12 * SR), int(1.8 * SR)
mix[:, :fade_in] *= np.linspace(0, 1, fade_in) ** 0.6
mix[:, -fade_out:] *= np.linspace(1, 0, fade_out) ** 1.4

with wave.open(OUT, "w") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix.T * 32767).astype(np.int16).tobytes())
pattern = "light" if LIGHT else ("four-on-the-floor" if FOUR_ON_FLOOR else "syncopated")
print(f"wrote {OUT} ({DUR:.2f}s, {BPM:.0f} bpm, {pattern})")
