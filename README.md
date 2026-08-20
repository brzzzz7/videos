# videos

Remotion project. Two vertical 1080×1920 / 30 fps reels cut from the barbershop
shoot, both driven by data rather than a hand-placed timeline.

| Composition | Output | Cut from |
| --- | --- | --- |
| **`Reel`** — hair diagnostic, 50 s | `renders/reel-vertical-1080x1920.mp4` | `public/talk.mp4` + `public/barber.mp4` |
| **`Morning`** — 3 morning mistakes, 40 s | `renders/reel-matin-1080x1920.mp4` | `public/shots/*.mp4` (cropped from the 4K take) |
| **`Split`** — same script, split-screen, 63 s | `renders/reel-split-1080x1920.mp4` | `public/talk3.mp4` (derushed take) |
| **`Solutions`** — hair loss, 73 s | `renders/reel-solutions-1080x1920.mp4` | a voice recording + `public/cta-chair.mp4` |
| **`Price`** — what 35 € pays for, 66 s | `renders/reel-prix-1080x1920.mp4` | `public/talk5.mp4` (mute) + a separate mp3 |

Bold-caption style for `Reel`, Apple-style captions with a soft shadow and
cross-dissolves for `Morning`.

| | |
| --- | --- |
| Audio (Reel) | `voice.m4a` (speech), `room.m4a` (ambience), `music.m4a` (100 bpm beat) |
| Audio (Morning) | `morning-voice.m4a` (speech, recovered from a −45 dBFS camera track), `morning-music.m4a` (124 bpm beat) |
| Audio (Split) | `voice3.m4a` (speech), `music-light.m4a` (104 bpm major bed), `sfx/*.m4a` (six light cue sounds) |
| Audio (Solutions) | `voice4.m4a` (speech), `music-suspense.m4a` (96 bpm minor build) |
| Audio (Price) | `voice5.m4a` (speech, from the separate mp3), `music-suspense.m4a` again, `sfx/*.m4a` |
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

### `Split` — the illustrated version

The take arrived already derushed, so nothing is cut: the reel runs the clip end
to end and only adds layers.

- **Split screen.** On the statements worth illustrating, the picture drops to
  the bottom half and an illustration panel opens above it. The picture window
  slides down to `BOTTOM_WINDOW_TOP` at the same time, so his face stays framed
  in that half instead of being cropped at the chin. Between cues the frame is
  full again — a permanent split turns into wallpaper.
- **Illustrations** are motion design, not stock: a counter, humidity gauges, a
  strand that loses its shape, a wash → dry → style timeline with the product in
  the wrong then the right place, the three products, the matte-wax exception,
  dose per day, and the CTA card over the barbershop b-roll
  (`components/illos/`).
- **Cue sounds** come from `scripts/sfx-light.py` — six distinct light sounds,
  each checked by `scripts/check-music.py`. `src/split.ts` throws if two
  consecutive cues would use the same one, or if two cues overlap.
- **Captions** are Montserrat 700, white, with a light shadow
  (`components/CaptionsMontserrat.tsx`).

The source is 608×1080, so it is upscaled to 1080×1920 with lanczos and a light
unsharp — that is as sharp as this take can get.

### `Solutions` — voice-over only

This one arrived as an audio recording with no camera, so there is no facecam to
fall back on and no footage to keep in sync:

- **Pauses were tightened freely** — `scripts/build-spans-voice.py` cuts anything
  over 0.45 s down to 0.2 s and drops spans that hold no speech at all (it
  measures each span against the file's speech level, which is how the breath
  before the first word gets removed). 18 s of dead air went, 88 s to 70 s.
  Point it at the raw recording, not the processed voice: `build-voice.py` lifts
  the floor ~17 dB and hides most pauses from `silencedetect`.
- **Seven full-frame scenes** run back to back and carry the whole picture
  (`components/illos/solutions.tsx`): the three numbered cards, the marketing
  promises struck through, minoxidil applied to a scalp diagram with a
  "you stop / it stops" card, finasteride blocking DHT before the follicle, the
  graft moving follicles from the donor band, the medical reminder split into
  "me: upkeep and style / the doctor: the diagnosis", and the CTA over the
  barber-chair clip with a pulsing ring.
- Cue sounds fire on each scene **and** on the beats inside the long ones;
  `src/solutions.ts` throws if any two consecutive sounds match.

### `Price` — what 35 € actually pays for

The picture arrived mute and the sound as its own mp3. Both are 66.04 s and were
recorded together: the camera's own scratch track, lifted 18 dB, transcribes to
the same words at the same timestamps as the mp3 (the phrase at 24.67 s starts
losing its first word once the window moves past 24.70 s), so the two are
aligned inside one frame and nothing needs sliding. Envelope cross-correlation
was useless here — the scratch track sits at −39 dBFS and correlates at 0.14
against nothing in particular; the transcript comparison is what settles it.

- **The split is permanent.** The whole script is one enumeration — training,
  kit, products, time, overheads — so the top half runs as a continuous
  breakdown and the cues in `src/data/price.ts` butt against each other rather
  than leaving gaps. Opening and closing the frame on every item is exactly the
  bouncing he flagged on the previous cut.
- **`BOTTOM_WINDOW_TOP = 760`** was chosen against frames sampled across the
  whole minute, not one still: he starts high in frame and drifts down, and 760
  is the window that keeps his face inside the bottom half from the first second
  to the last.
- **Nine panels** (`components/illos/price.tsx`): the price with a brace under
  it, years of training filling a bar, the supermarket clipper against the pro
  one, the 5 € product crossed out, a rushed cut against a finished one, twelve
  cuts a year dropping to eight, the bills stacking up, and the low-cost trade.
  Each lands on the words that carry it — the "un savoir-faire" stamp at 12.3 s,
  the electricity line at 46.5 s.
- The low-cost panel strikes **one** pillar, not three: he says a cheap salon
  removes *one* of these points, so the mark hunts across the three while he
  names them and locks onto the last. The first version crossed out all three,
  which says something he did not.
- **The CTA animation** gathers the four items onto a ring, dissolves them into
  a card and pulses a halo behind "prends rendez-vous". They stop on the ring
  instead of collapsing to a point — piling four labels on one spot made a blob.

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

The music is synthesised, not licensed: `scripts/music.py` writes a bed with
numpy — `python3 scripts/music.py <seconds> <out.wav> [bpm] [mood]`. Three
moods: `punchy` (minor, driving, four on the floor from 115 bpm up), `light`
(major I–V–vi–IV, marimba, brushed drums) and `suspense` (A minor pedal, a
staccato ostinato circling it, a clock tick, and a level that climbs ~9 dB from
start to end — for a reel that should feel like it is building). Its first version crackled, so the engine now follows
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
