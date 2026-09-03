#!/usr/bin/env python3
"""Build the Morning voice track: rescue the level, then cap the peaks for real.

    python3 scripts/build-voice.py <source.mp4> <out.m4a> [ffmpeg]

Both chains start with a de-click: a mouth click sitting at -30 dBFS in the raw
recording is inaudible there, but the compressor and the normalisation lift it
by ~12 dB and a sparse music bed no longer masks it. Measured on this recording:
73 click-like outliers down to 28, with the speech itself altered 40 dB below
the signal.

The camera mic recorded at about -45 dBFS, so the voice needs a big lift. ffmpeg's
own `loudnorm`/`alimiter` did not hold their true-peak ceiling in this build
(measured 0 dBFS output with `limit=0.80`), and the overshoot clipped once the
music was summed on top. So the level stage is done here instead, where it can
be measured: denoise and compress in ffmpeg, then set the speech level and
block-limit the peaks in numpy.
"""

import os
import subprocess
import sys

import numpy as np

SRC = sys.argv[1] if len(sys.argv) > 1 else None
OUT = sys.argv[2] if len(sys.argv) > 2 else "voice.m4a"
FFMPEG = sys.argv[3] if len(sys.argv) > 3 else "ffmpeg"

SR = 48000
SPEECH_TARGET_DBFS = -10.0   # RMS of the loud half of the speech
PEAK_CEILING = 0.80          # leaves ~2 dB for the music sum and AAC overshoot

# Two recordings, two starting points: the camera-mic take needed a 26 dB lift
# and heavy denoising, a normally-recorded take only needs de-rumbling.
CHAINS = {
    "rescue": (
        "adeclick=w=55:o=75:a=2:t=2,"   # mouth clicks, before anything amplifies them
        "volume=26dB,"
        "highpass=f=95,"
        "afftdn=nr=22:nf=-36,"
        "acompressor=threshold=-20dB:ratio=4:attack=6:release=160,"
        "deesser=i=0.25"
    ),
    "clean": (
        "adeclick=w=55:o=75:a=2:t=2,"   # mouth clicks, before the compressor lifts them
        "highpass=f=110,"                 # room rumble only
        "afftdn=nr=10:nf=-45,"
        "acompressor=threshold=-22dB:ratio=3:attack=8:release=180,"
        "deesser=i=0.2"
    ),
}
MODE = os.environ.get("VOICE_MODE", "rescue")
CHAIN = CHAINS[MODE]

# Optional speed-up, baked into the file rather than left to the renderer.
# Remotion can retime audio itself — it sends `playbackRate` through `atempo` —
# but baking it here gives the reel a single, checkable timebase: the output is
# exactly source/TEMPO long, so a clip trimmed at srcFrom/TEMPO lands where the
# frame maths says. Measured on the Questions reel, all 16 clips sit within
# 0.06 s of their predicted position.
TEMPO = float(os.environ.get("VOICE_TEMPO", "1"))
if TEMPO != 1.0:
    CHAIN = f"{CHAIN},atempo={TEMPO:.5f}"


def decode():
    raw = subprocess.run(
        [FFMPEG, "-hide_banner", "-loglevel", "error", "-i", SRC, "-vn",
         "-af", CHAIN, "-ac", "1", "-ar", str(SR),
         "-c:a", "pcm_f32le", "-f", "f32le", "-"],
        capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)


def speech_level(x, block=0.4):
    n = int(block * SR)
    frames = x[: len(x) // n * n].reshape(-1, n)
    rms = np.sqrt((frames ** 2).mean(1) + 1e-15)
    loud = rms[rms > np.percentile(rms, 60)]
    return float(loud.mean())


def limit(x, ceiling, block=0.001, release=0.08):
    """Block-wise peak limiter with a smooth release — no waveshaping."""
    n = int(block * SR)
    pad = (-len(x)) % n
    padded = np.concatenate([x, np.zeros(pad)])
    blocks = padded.reshape(-1, n)
    peak = np.abs(blocks).max(1)
    gain = np.minimum(1.0, ceiling / np.maximum(peak, 1e-9))

    # a gain reduction must not recover faster than `release`
    steps = max(1, int(release / block))
    smoothed = gain.copy()
    for shift in range(1, steps + 1):
        smoothed[shift:] = np.minimum(smoothed[shift:], gain[:-shift])
    # and it must arrive a block early, so the attack is not audible
    smoothed[:-1] = np.minimum(smoothed[:-1], smoothed[1:])

    ramp = np.interp(
        np.arange(len(padded)),
        np.arange(len(smoothed)) * n + n / 2,
        smoothed,
        left=smoothed[0], right=smoothed[-1],
    )
    return (padded * ramp)[: len(x)]


def main():
    if not SRC:
        sys.exit("usage: build-voice.py <source.mp4> <out.m4a> [ffmpeg]")
    print(f"  chain: {MODE}" + (f" @ {TEMPO:.3f}x" if TEMPO != 1 else ""))
    x = decode()
    before = speech_level(x)
    x *= 10 ** (SPEECH_TARGET_DBFS / 20) / max(before, 1e-9)
    print(f"  speech level {20 * np.log10(before):.1f} -> "
          f"{20 * np.log10(speech_level(x)):.1f} dBFS")

    peak_before = np.abs(x).max()
    x = limit(x, PEAK_CEILING)
    print(f"  peak {peak_before:.2f} -> {np.abs(x).max():.2f} "
          f"({20 * np.log10(1 / np.abs(x).max()):.1f} dB of headroom left)")

    pcm = np.clip(x, -1, 1).astype(np.float32).tobytes()
    subprocess.run(
        [FFMPEG, "-hide_banner", "-loglevel", "error",
         "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-",
         "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", OUT, "-y"],
        input=pcm, check=True)

    # verify what the encoder actually produced
    back = subprocess.run(
        [FFMPEG, "-hide_banner", "-loglevel", "error", "-i", OUT,
         "-ac", "1", "-ar", str(SR), "-c:a", "pcm_f32le", "-f", "f32le", "-"],
        capture_output=True, check=True).stdout
    decoded = np.frombuffer(back, dtype=np.float32)
    over = int((np.abs(decoded) >= 0.999).sum())
    print(f"  decoded peak {np.abs(decoded).max():.3f}, {over} clipped samples "
          f"-> {os.path.basename(OUT)}")
    if over:
        sys.exit("voice track clips after encoding")


main()
