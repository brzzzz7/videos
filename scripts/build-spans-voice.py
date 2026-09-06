#!/usr/bin/env python3
"""Tighten the dead air in a voice-over and write the kept spans as JSON.

    python3 scripts/build-spans-voice.py <raw-recording> <out.json> [ffmpeg]

Point it at the RAW recording, not at the processed voice track: build-voice.py
lifts the noise floor by ~17 dB, which hides most pauses from silencedetect. The
timing is identical either way, so spans measured on the raw file apply to the
processed one — and to a mute picture shot alongside it, which is how the Price
reel cuts image and sound in lockstep.

Thresholds are env-overridable: SPANS_CUT_ABOVE, SPANS_KEEP, SPANS_HEAD_KEEP,
SPANS_NOISE, SPANS_MIN_SILENCE.

A recording made without a camera has nothing to keep in sync, so pauses can be
trimmed freely. Anything longer than CUT_ABOVE is reduced to KEEP — long enough
to still breathe between sentences, short enough that the reel does not stall.
"""

import json
import os
import subprocess
import sys

import numpy as np

SRC = sys.argv[1] if len(sys.argv) > 1 else None
OUT = sys.argv[2] if len(sys.argv) > 2 else "spans.json"
FFMPEG = sys.argv[3] if len(sys.argv) > 3 else "ffmpeg"

NOISE = os.environ.get("SPANS_NOISE", "-34dB")
MIN_SILENCE = os.environ.get("SPANS_MIN_SILENCE", "0.25")
# How hard to tighten. A voice-over with no picture takes the defaults; a take
# that also has to cut its own footage wants a shorter KEEP, because a jump cut
# reads as a beat all by itself.
CUT_ABOVE = float(os.environ.get("SPANS_CUT_ABOVE", "0.45"))
KEEP = float(os.environ.get("SPANS_KEEP", "0.20"))
HEAD_KEEP = float(os.environ.get("SPANS_HEAD_KEEP", "0.15"))
MIN_SPAN = 0.30
SPEECH_FLOOR_DB = -26.0   # a span this far under the speech level holds no words


def silences():
    err = subprocess.run(
        [FFMPEG, "-hide_banner", "-i", SRC, "-af",
         f"silencedetect=noise={NOISE}:d={MIN_SILENCE}", "-f", "null", "-"],
        capture_output=True, text=True).stderr
    hms = err.split("Duration: ")[1].split(",")[0].split(":")
    total = int(hms[0]) * 3600 + int(hms[1]) * 60 + float(hms[2])
    gaps, start = [], None
    for line in err.splitlines():
        if "silence_start:" in line:
            start = float(line.split("silence_start:")[1].split("|")[0])
        elif "silence_end:" in line and start is not None:
            gaps.append((start, float(line.split("silence_end:")[1].split("|")[0])))
            start = None
    return gaps, total


def decode():
    raw = subprocess.run(
        [FFMPEG, "-hide_banner", "-loglevel", "error", "-i", SRC, "-vn",
         "-ac", "1", "-ar", "16000", "-c:a", "pcm_f32le", "-f", "f32le", "-"],
        capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32)


def rms(x):
    return float(np.sqrt((x.astype(np.float64) ** 2).mean() + 1e-15))


def extend_tail(spans, samples, sr=16000, limit=0.5):
    """Run the last span to the true end of the utterance.

    The gate that is right for pauses in the middle of a take is too high for
    the end of one: a final consonant decays, and the tail of "tendance" on this
    recording faded from -33 to -56 dBFS over 0.2 s, so silencedetect called the
    word over while the sibilance was still running. Dropping the gate globally
    would move every boundary, so only the last one is re-measured — and against
    the recording's own room tone rather than an absolute dBFS gate, because an
    absolute one silently means "loud recording" and this camera track sits 17 dB
    below the processed voice. The tail is over when it reaches the room, so the
    floor is 8 dB above it; `limit` stops a noisy stretch running away.
    """
    if not spans:
        return spans
    block = int(0.02 * sr)
    n_all = len(samples) // block
    levels = np.array([rms(samples[i * block:(i + 1) * block]) for i in range(n_all)])
    room = float(np.percentile(levels, 10))
    floor = room * 10 ** (8 / 20)
    tail = samples[int(spans[-1][1] * sr):int((spans[-1][1] + limit) * sr)]
    last = 0
    for i in range(len(tail) // block):
        if rms(tail[i * block:(i + 1) * block]) > floor:
            last = i + 1
    if last:
        grown = round(spans[-1][1] + last * block / sr + 0.04, 3)
        print(f"  tail: last span {spans[-1][1]:.2f} -> {grown:.2f} "
              f"(decays to room tone {20 * np.log10(max(room, 1e-9)):.0f} dBFS "
              f"after the gate calls it over)")
        spans[-1][1] = grown
    return spans


def drop_silent(spans, samples, sr=16000):
    """Remove spans that hold no speech — a breath before the first word, say."""
    levels = [rms(samples[int(a * sr):int(b * sr)]) for a, b in spans]
    speech = np.percentile(levels, 70)
    keep, dropped = [], []
    for span, level in zip(spans, levels):
        if 20 * np.log10(max(level, 1e-9) / speech) < SPEECH_FLOOR_DB:
            dropped.append((span, level))
        else:
            keep.append(span)
    for span, level in dropped:
        print(f"  dropped {span[0]:6.2f} - {span[1]:6.2f}  "
              f"({20 * np.log10(max(level, 1e-9) / speech):5.1f} dB under speech: no words)")
    return keep


def main():
    if not SRC:
        sys.exit("usage: build-spans-voice.py <audio> <out.json> [ffmpeg]")
    gaps, total = silences()
    spans, cursor = [], 0.0
    for a, b in gaps:
        if b - a <= CUT_ABOVE:
            continue
        if not spans and a < 0.2:            # head silence: keep a beat of it
            cursor = max(0.0, b - HEAD_KEEP)
            continue
        end = a + KEEP / 2
        if end - cursor < MIN_SPAN:
            continue
        spans.append([round(cursor, 3), round(end, 3)])
        cursor = b - KEEP / 2
    if total - cursor > MIN_SPAN:
        spans.append([round(cursor, 3), round(min(total, cursor + (total - cursor)), 3)])

    samples = decode()
    spans = drop_silent(spans, samples)
    spans = extend_tail(spans, samples)
    kept = sum(b - a for a, b in spans)
    with open(OUT, "w") as f:
        json.dump({"source": os.path.basename(SRC),
                   "sourceDuration": round(total, 3), "spans": spans}, f, indent=2)
    print(f"{len(spans)} spans, {kept:.2f}s kept of {total:.2f}s "
          f"({total - kept:.2f}s of dead air cut) -> {OUT}")
    for a, b in spans:
        print(f"  {a:6.2f} - {b:6.2f}  ({b - a:5.2f}s)")


main()
