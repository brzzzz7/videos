#!/usr/bin/env python3
"""Rebuild src/data/spans.json — the jump-cut list — from the voice track.

Every silence longer than CUT_ABOVE is tightened to a KEEP-second breath, which
is what gives the reel its pace. Re-run this if you replace talk.mp4.

    python3 scripts/build_spans.py [path/to/ffmpeg]
"""

import json
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FFMPEG = sys.argv[1] if len(sys.argv) > 1 else "ffmpeg"
SOURCE = os.path.join(ROOT, "public", "talk.mp4")
OUT = os.path.join(ROOT, "src", "data", "spans.json")

CUT_ABOVE = 0.30
KEEP = 0.10
MIN_SPAN = 0.40


def silences():
    err = subprocess.run(
        [FFMPEG, "-hide_banner", "-i", SOURCE, "-vn", "-af",
         "silencedetect=noise=-30dB:d=0.15", "-f", "null", "-"],
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


def main():
    gaps, total = silences()
    spans, cursor = [], 0.0
    for a, b in gaps:
        if b - a <= CUT_ABOVE:
            continue
        end = a + KEEP / 2
        if end - cursor < MIN_SPAN:
            if not spans and a < 0.2:
                cursor = max(0.0, b - KEEP / 2)   # trim the head silence
            continue
        spans.append([round(cursor, 3), round(end, 3)])
        cursor = b - KEEP / 2
    if total - cursor > MIN_SPAN:
        spans.append([round(cursor, 3), round(total, 3)])

    kept = sum(b - a for a, b in spans)
    with open(OUT, "w") as f:
        json.dump({"sourceDuration": round(total, 3), "spans": spans}, f, indent=2)
    print(f"{len(spans)} spans, {kept:.2f}s kept of {total:.2f}s "
          f"({total - kept:.2f}s of dead air cut) -> {OUT}")


main()
