# videos

Remotion project. Two vertical 1080×1920 / 30 fps reels cut from the barbershop
shoot, both driven by data rather than a hand-placed timeline.

| Composition | Output | Cut from |
| --- | --- | --- |
| **`Reel`** — hair diagnostic, 50 s | `renders/reel-vertical-1080x1920.mp4` | `public/talk.mp4` + `public/barber.mp4` |
| **`Morning`** — 3 morning mistakes, 40 s | `renders/reel-matin-1080x1920.mp4` | `public/shots/*.mp4` (cropped from the 4K take) |

Bold-caption style for `Reel`, Apple-style captions with a soft shadow and
cross-dissolves for `Morning`.

| | |
| --- | --- |
| Audio (Reel) | `voice.m4a` (speech), `room.m4a` (ambience), `music.m4a` (100 bpm beat) |
| Audio (Morning) | `morning-voice.m4a` (speech, recovered from a −45 dBFS camera track), `morning-music.m4a` (124 bpm beat) |
| Shared | `whoosh.m4a`, `impact.m4a` (transitions) |

## Commands

```console
npm i
npm run dev              # Remotion Studio, scrub either edit
npm run render           # Reel    -> out/reel-vertical-1080x1920.mp4
npm run render:morning   # Morning -> out/reel-matin-1080x1920.mp4
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

## How the edits are built

Both reels share `src/lib/captions.ts`: word timings are spread inside each
phrase by syllable weight, so drift can never cross a pause, and lines are
grouped into caption cards.

### `Reel` — the diagnostic

`src/timeline.ts` derives everything in frames from two files:

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

### `Morning` — the 3 mistakes

This source was a single 3-minute 4K vertical take with the camera mic
unplugged, so it needed two rescues before editing:

- **Sound.** The voice sat at about −45 dBFS. `scripts/build-voice.py` lifts it
  26 dB, denoises, compresses and de-esses, then sets the speech level and caps
  the peaks in numpy — ffmpeg's `alimiter` did not hold its ceiling in this
  build (0 dBFS output with `limit=0.80`) and the overshoot clipped once the
  music was summed on top. The script verifies the encoded file, so a clipping
  voice track fails the build instead of shipping.
- **Framing.** 2160×3840 means three different framings can be cropped out of
  the one take at or near native 1080×1920 (`mid`, `med`, `close`), which is
  where the cutting variety comes from. `scripts/cut-shots.py` writes one file
  per shot plus 8 handle frames at each end — those handles are what pay for
  the cross-dissolves.
- Where he leans out of frame mid-sentence, a shot borrows its picture from
  another moment of the same take (`pictureStart` in the manifest) while
  keeping the original voice. `scripts/presence.py` finds those moments.

`src/data/morning.ts` holds the copy (one entry per shot, hook, end card) and
`src/morning.ts` assembles clips, captions, section labels and the dissolves.

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

For `Morning`: `components/CaptionsApple.tsx` (semibold sentence case, soft
shadow, words a frame apart), and `MorningReel.tsx` for the title, the
"Erreur 01" tags, the dissolving shot track and the end card.

Colours and safe areas live in `src/theme.ts` — `safe.bottom` keeps the
subtitles clear of Instagram's chrome.

## Assets

`scripts/prepare-assets.sh <talking-head> <barbershop> [ffmpeg]` rebuilds
everything in `public/` from the camera originals: scales/pads the talking head,
applies the rotation and tone-maps the HLG/BT.2020 iPhone clip down to SDR,
splits the speech out to its own track (so cuts trim video and audio in
lockstep), and renders the music.

The music is synthesised, not licensed: `scripts/music.py` writes an Am–F–C–G
bed with numpy — `python3 scripts/music.py <seconds> <out.wav> [bpm]`, four on
the floor from 115 bpm up. Its first version crackled, so the engine now follows
three rules: noise elements are FFT band-limited (raw white noise is what you
hear as crackle), nothing is tanh-saturated, and every voice has a real attack
and release. `scripts/check-music.py` enforces that on the output — it measures
clipping, click-like outliers against the local level, and A-weighted band
shares, and fails the build on a bed that is noise-dominated or sub-heavy. The
transition sweep and the card thump come from `scripts/sfx.py`.

Fonts (Anton, Inter) are inlined into `src/fonts.css` as data URIs by
`python3 scripts/inline-fonts.py`, so no render worker ever waits on a font
request — re-run it if you change the faces in `scripts/inline-fonts.py`.

## Subtitles are auto-transcribed

The French transcript came from whisper and was cleaned by hand — worth a
proof-read before posting. Everything is in `src/data/script.ts`; the timings
follow the text automatically.
