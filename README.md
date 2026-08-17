# videos

Remotion project. Currently one composition: **`Reel`** — a vertical
1080×1920 / 30 fps reel cut from two clips of the barbershop shoot.

| | |
| --- | --- |
| Output | `renders/reel-vertical-1080x1920.mp4` (1080×1920, h264, 50 s, 33 MB) — committed |
| Sources | `public/talk.mp4` (talking head), `public/barber.mp4` (shop b-roll) |
| Audio | `public/voice.m4a` (speech), `public/room.m4a` (ambience), `public/music.m4a` (beat), `public/whoosh.m4a` + `public/impact.m4a` (transitions) |

## Commands

```console
npm i
npm run dev      # Remotion Studio, scrub the edit
npm run render   # writes out/reel-vertical-1080x1920.mp4
```

`out/` is gitignored scratch space — copy a cut you want to keep into
`renders/`, which is committed. For a lighter file to upload from a phone:

```console
ffmpeg -i renders/reel-vertical-1080x1920.mp4 -c:v libx264 -preset slow -crf 23 \
  -pix_fmt yuv420p -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -c:a aac -b:a 160k -movflags +faststart reel-light.mp4
```

If Remotion can't download its own Chromium (locked-down network), point it at
an existing one:

```console
REMOTION_BROWSER=/path/to/chrome npm run render
```

## How the edit is built

The edit is data, not a hand-placed timeline — `src/timeline.ts` derives
everything in frames from two files:

- **`src/data/spans.json`** — the jump-cut list. Generated from the silence map
  of the voice track: every pause longer than 0.3 s is tightened to a 0.1 s
  breath, which is what removes 4.4 s of dead air and gives the reel its pace.
  Regenerate with `python3 scripts/build_spans.py <ffmpeg>`.
- **`src/data/script.ts`** — the transcript, anchored to source timestamps, plus
  the hook copy, the chapter labels, the emphasised words and the CTA copy.
  This is the file to edit for wording changes.

From those, `timeline.ts` produces the clips, per-word subtitle timings (words
are spread across each phrase by syllable weight, so drift stays inside a
phrase), the chapter card frames, and the frame where the reel cuts away to the
b-roll.

## What is on screen

| Layer | File | Notes |
| --- | --- | --- |
| Hook | `components/Hook.tsx` | First 2.2 s: “En 2 secondes / je sais tout / sur tes cheveux”. Subtitles stay hidden until it clears. |
| Footage | `components/VideoTrack.tsx` | Jump cuts, alternating zoom levels, a spring kick on every cut and phrase start, framed-down state during chapter cards, then the barbershop b-roll. |
| Subtitles | `components/Subtitles.tsx` | Anton, uppercase, 2–3 words per line, black stroke, gold marker swipe on the word being said. |
| Chapter cards | `components/ChapterCard.tsx` | The “01 — Le cuir chevelu” band that slams in on each of his four points. |
| HUD | `components/Hud.tsx` | Progress bar, chapter dots, current-point pill. Fades out at the cutaway. |
| End card | `components/Cta.tsx` | Over the b-roll, after the voice-over: “Prends ton RDV”. |
| Texture | `components/Backdrop.tsx`, `components/Grain.tsx` | Animated backdrop behind framed-down shots, film grain, vignette. |

Colours and safe areas live in `src/theme.ts` — `safe.bottom` keeps the
subtitles clear of Instagram's chrome.

## Assets

`scripts/prepare-assets.sh <talking-head> <barbershop> [ffmpeg]` rebuilds
everything in `public/` from the camera originals: scales/pads the talking head,
applies the rotation and tone-maps the HLG/BT.2020 iPhone clip down to SDR,
splits the speech out to its own track (so cuts trim video and audio in
lockstep), and renders the music.

The music is synthesised, not licensed: `scripts/music.py` writes a 100 bpm
Am–F–C–G beat (kick, snare, claps, hats, sub bass, chord stabs, arp, riser and
impacts) with numpy. `python3 scripts/music.py <seconds> <out.wav>`. The
transition sweep and the card thump come from `scripts/sfx.py` the same way.

Fonts (Anton, Inter) are inlined into `src/fonts.css` as data URIs by
`python3 scripts/inline-fonts.py`, so no render worker ever waits on a font
request — re-run it if you change the faces in `scripts/inline-fonts.py`.

## Subtitles are auto-transcribed

The French transcript came from whisper and was cleaned by hand — worth a
proof-read before posting. Everything is in `src/data/script.ts`; the timings
follow the text automatically.
