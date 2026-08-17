"""Generate an original punchy beat for the reel (no samples, pure synthesis)."""

import sys
import wave

import numpy as np

SR = 48000
BPM = 100.0
BEAT = 60.0 / BPM          # 0.6 s
BAR = 4 * BEAT             # 2.4 s
DUR = float(sys.argv[1]) if len(sys.argv) > 1 else 60.0
OUT = sys.argv[2] if len(sys.argv) > 2 else "beat.wav"

rng = np.random.default_rng(7)
L = int(DUR * SR) + SR
left = np.zeros(L)
right = np.zeros(L)


def add(buf, pos, sig, gain=1.0, pan=0.0):
    """Mix sig into the stereo bus at time pos (seconds) with constant-power pan."""
    i = int(pos * SR)
    if i < 0:
        sig = sig[-i:]
        i = 0
    n = min(len(sig), L - i)
    if n <= 0:
        return
    ang = (pan + 1) * np.pi / 4
    left[i:i + n] += sig[:n] * gain * np.cos(ang) * np.sqrt(2) / 1.0
    right[i:i + n] += sig[:n] * gain * np.sin(ang) * np.sqrt(2) / 1.0
    if buf is not None:
        buf[i:i + n] += sig[:n] * gain


def env(n, a, d, s=0.0, r=0.0, sus=0.7):
    """Simple ADSR over n samples (times in seconds)."""
    a, d, r = int(a * SR), int(d * SR), int(r * SR)
    s = max(0, n - a - d - r)
    parts = [
        np.linspace(0, 1, a, endpoint=False) if a else np.zeros(0),
        np.linspace(1, sus, d, endpoint=False) if d else np.zeros(0),
        np.full(s, sus),
        np.linspace(sus, 0, r) if r else np.zeros(0),
    ]
    out = np.concatenate(parts)
    return np.pad(out, (0, max(0, n - len(out))))[:n]


def expdec(n, tau):
    return np.exp(-np.arange(n) / (tau * SR))


def lowpass(x, cutoff):
    """One-pole lowpass, cutoff in Hz."""
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc = (1 - a) * v + a * acc
        y[i] = acc
    return y


def highpass(x, cutoff):
    return x - lowpass(x, cutoff)


def kick(dur=0.42):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 48 + 110 * np.exp(-t / 0.028)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * expdec(n, 0.11)
    click = highpass(rng.normal(0, 1, n) * expdec(n, 0.004), 1800) * 0.25
    return np.tanh((body + click) * 1.5) * 0.82


def snare(dur=0.22, bright=1.0):
    n = int(dur * SR)
    noise = highpass(rng.normal(0, 1, n), 900 * bright) * expdec(n, 0.055)
    t = np.arange(n) / SR
    tone = (np.sin(2 * np.pi * 185 * t) + np.sin(2 * np.pi * 278 * t)) * expdec(n, 0.03)
    return np.tanh((noise * 0.9 + tone * 0.5) * 1.2) * 0.9


def clap(dur=0.3):
    n = int(dur * SR)
    out = np.zeros(n)
    for k, off in enumerate([0, 0.009, 0.019, 0.03]):
        i = int(off * SR)
        seg = highpass(rng.normal(0, 1, n - i), 1200) * expdec(n - i, 0.02 + 0.03 * (k == 3))
        out[i:] += seg * (0.55 if k < 3 else 1.0)
    return out * 0.66


def hat(dur=0.07, open_=False, cut=6500):
    n = int(dur * SR)
    tau = 0.09 if open_ else 0.012
    return highpass(rng.normal(0, 1, n) * expdec(n, tau), cut) * 0.55


def bass(freq, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    sub = np.sin(2 * np.pi * freq * t)
    saw = 2 * ((freq * t) % 1) - 1
    sig = lowpass(sub * 0.85 + saw * 0.3, 260)
    return np.tanh(sig * 1.4) * env(n, 0.006, 0.05, r=0.06, sus=0.85) * 0.42


def pluck(freq, dur, detune=0.004, cut=3400, gain=0.16):
    n = int(dur * SR)
    t = np.arange(n) / SR
    sig = np.zeros(n)
    for d in (-detune, 0.0, detune):
        f = freq * (1 + d)
        sig += 2 * ((f * t) % 1) - 1
    sig = lowpass(sig / 3, cut) * expdec(n, 0.16) * env(n, 0.004, 0.02, r=0.05, sus=0.9)
    return sig * gain


def stab(freqs, dur, gain=0.13, cut=2900):
    n = int(dur * SR)
    out = np.zeros(n)
    for f in freqs:
        out += pluck(f, dur, cut=cut, gain=1.0)
    return out / len(freqs) * gain


def riser(dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    noise = rng.normal(0, 1, n)
    swept = np.zeros(n)
    # coarse band sweep: crossfade a few highpass stages
    for k, c in enumerate([400, 1200, 3000, 7000]):
        w = np.clip(1 - abs(t / dur - k / 3) * 3, 0, 1)
        swept += highpass(noise, c) * w
    ramp = (t / dur) ** 2
    return swept * ramp * 0.22


def impact():
    n = int(1.4 * SR)
    t = np.arange(n) / SR
    boom = np.sin(2 * np.pi * (70 * np.exp(-t / 0.25) + 34) * t) * expdec(n, 0.34)
    crash = highpass(rng.normal(0, 1, n), 4000) * expdec(n, 0.42) * 0.25
    return np.tanh((boom * 1.1 + crash) * 1.2) * 0.7


def reverb(x, taps=((0.031, 0.34), (0.053, 0.26), (0.079, 0.19), (0.114, 0.13))):
    out = np.zeros_like(x)
    for d, g in taps:
        i = int(d * SR)
        out[i:] += x[:len(x) - i] * g
    return lowpass(out, 4200)


# ---------------------------------------------------------------- arrangement
# Am - F - C - G  (i - VI - III - VII), one chord per bar
NOTE = {"A2": 110.00, "C3": 130.81, "E3": 164.81, "F2": 87.31, "A3": 220.00,
        "C4": 261.63, "E4": 329.63, "G2": 98.00, "B3": 246.94, "D4": 293.66,
        "F3": 174.61, "G3": 196.00, "A4": 440.00, "G4": 392.00, "F4": 349.23}
PROG = [
    ("A2", [NOTE["A3"], NOTE["C4"], NOTE["E4"]]),
    ("F2", [NOTE["A3"], NOTE["C4"], NOTE["F4"]]),
    ("C3", [NOTE["C4"], NOTE["E4"], NOTE["G4"]]),
    ("G2", [NOTE["B3"], NOTE["D4"], NOTE["G4"]]),
]
ARP = [[NOTE["A3"], NOTE["C4"], NOTE["E4"], NOTE["C4"]],
       [NOTE["A3"], NOTE["C4"], NOTE["F4"], NOTE["C4"]],
       [NOTE["C4"], NOTE["E4"], NOTE["G4"], NOTE["E4"]],
       [NOTE["B3"], NOTE["D4"], NOTE["G4"], NOTE["D4"]]]

n_bars = int(np.ceil(DUR / BAR)) + 1
lead_bus = np.zeros(L)

add(None, 0.0, impact(), 0.9)
add(None, 0.0, riser(BAR * 0.9), 0.8)

for b in range(n_bars):
    t0 = b * BAR
    root, chord = PROG[b % 4]
    section_in = t0 > BAR * 0.5            # groove starts after the intro bar
    late = t0 > DUR - BAR * 2              # last two bars: CTA lift

    # kick pattern (trap-ish, syncopated)
    for off in (0.0, 1.5, 2.0, 3.5):
        add(None, t0 + off * BEAT, kick(), 0.9)
    if b % 4 == 3:
        add(None, t0 + 2.75 * BEAT, kick(), 0.7)

    if section_in:
        # backbeat
        add(None, t0 + 1 * BEAT, snare(), 0.55, pan=-0.05)
        add(None, t0 + 3 * BEAT, clap(), 0.6, pan=0.05)
        # hats: 8ths with 16th rolls
        for i in range(8):
            p = t0 + i * BEAT / 2
            add(None, p, hat(), 0.5 if i % 2 == 0 else 0.32, pan=0.18)
            if i in (3, 7):
                add(None, p + BEAT / 4, hat(dur=0.05), 0.26, pan=-0.18)
        if b % 4 == 3:
            add(None, t0 + 3.5 * BEAT, hat(dur=0.22, open_=True), 0.35, pan=0.2)

        # bass: root on 1, octave push on 2.5 and 3.5
        f = NOTE[root]
        add(None, t0, bass(f, BEAT * 1.4), 1.0)
        add(None, t0 + 1.5 * BEAT, bass(f, BEAT * 0.5), 0.8)
        add(None, t0 + 2.0 * BEAT, bass(f * 1.5, BEAT * 0.5), 0.6)
        add(None, t0 + 3.5 * BEAT, bass(f, BEAT * 0.5), 0.8)

        # chord stab on the off-beat + arp sparkle
        gain = 0.30 if not late else 0.40
        s = stab(chord, BEAT * 1.1, gain=gain)
        add(lead_bus, t0 + 0.5 * BEAT, s, 1.0, pan=-0.12)
        add(lead_bus, t0 + 2.5 * BEAT, stab(chord, BEAT * 0.8, gain=gain * 0.8), 1.0, pan=0.12)
        arp = ARP[b % 4]
        for i in range(8):
            note = arp[i % 4] * (2.0 if (i >= 4 and late) else 1.0)
            add(lead_bus, t0 + i * BEAT / 2, pluck(note, BEAT * 0.45, gain=0.14 if not late else 0.19),
                1.0, pan=0.25 if i % 2 else -0.25)

    if late and b == n_bars - 2:
        add(None, t0, impact(), 0.5)

# a touch of space on the melodic bus only
wet = reverb(lead_bus) * 0.5
add(None, 0.0, wet, 1.0, pan=-0.3)
add(None, 0.0, wet, 1.0, pan=0.3)

mix = np.vstack([left, right])[:, :int(DUR * SR)]

# gentle master: soft clip, fade in/out, normalise to about -14 LUFS-ish peak room
mix = np.tanh(mix * 1.05)
fade_in = int(0.05 * SR)
fade_out = int(1.6 * SR)
mix[:, :fade_in] *= np.linspace(0, 1, fade_in)
mix[:, -fade_out:] *= np.linspace(1, 0, fade_out) ** 1.5
mix /= max(1e-9, np.abs(mix).max())
mix *= 0.89

pcm = (mix.T * 32767).astype(np.int16)
with wave.open(OUT, "w") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(f"wrote {OUT} ({DUR:.2f}s, {BPM:.0f} bpm)")
