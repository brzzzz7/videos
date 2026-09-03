# videos

Remotion project. Two vertical 1080×1920 / 30 fps reels cut from the barbershop
shoot, both driven by data rather than a hand-placed timeline.

| Composition | Output | Cut from |
| --- | --- | --- |
| **`Reel`** — hair diagnostic, 50 s | `renders/reel-vertical-1080x1920.mp4` | `public/talk.mp4` + `public/barber.mp4` |
| **`Morning`** — 3 morning mistakes, 40 s | `renders/reel-matin-1080x1920.mp4` | `public/shots/*.mp4` (cropped from the 4K take) |
| **`Split`** — same script, split-screen, 63 s | `renders/reel-split-1080x1920.mp4` | `public/talk3.mp4` (derushed take) |
| **`Solutions`** — hair loss, 73 s | `renders/reel-solutions-1080x1920.mp4` | a voice recording + `public/cta-chair.mp4` |
| **`Price`** — what 35 € pays for, 57 s | `renders/reel-prix-1080x1920.mp4` | `public/talk5.mp4` (mute) + a separate mp3 |
| **`Stories`** — 3 client horror stories, 40 s | `renders/reel-temoignages-1080x1920.mp4` | `public/talk6.mp4` |
| **`Questions`** — the "worst" questions to ask, 35 s | `renders/reel-questions-1080x1920.mp4` | `public/talk7.mp4` |
| **`Style`** — is the trending cut for you, 21 s | `renders/reel-coupe-1080x1920.mp4` | `public/talk8.mp4` + `public/cut-broll.mp4` |
| **`Errors`** — 3 mistakes he sees every day, 25 s | `renders/reel-erreurs-1080x1920.mp4` | `public/talk9.mp4` |

Bold-caption style for `Reel`, Apple-style captions with a soft shadow and
cross-dissolves for `Morning`.

| | |
| --- | --- |
| Audio (Reel) | `voice.m4a` (speech), `room.m4a` (ambience), `music.m4a` (100 bpm beat) |
| Audio (Morning) | `morning-voice.m4a` (speech, recovered from a −45 dBFS camera track), `morning-music.m4a` (124 bpm beat) |
| Audio (Split) | `voice3.m4a` (speech), `music-light.m4a` (104 bpm major bed), `sfx/*.m4a` (six light cue sounds) |
| Audio (Solutions) | `voice4.m4a` (speech), `music-suspense.m4a` (96 bpm minor build) |
| Audio (Price) | `voice5.m4a` (speech, from the separate mp3), `music-suspense.m4a` again, `sfx/*.m4a` |
| Audio (Stories) | `voice6.m4a` (speech, recovered from a −39 LUFS camera track), `music-suspense.m4a` again, `sfx/*.m4a` |
| Audio (Questions) | `voice7.m4a` (speech), `music-suspense.m4a` again, `sfx/*.m4a` |
| Audio (Style) | `voice8.m4a` (speech), `music-suspense.m4a` again, `sfx/*.m4a` |
| Audio (Errors) | `voice9.m4a` (speech), `music-suspense.m4a` again, `sfx/*.m4a` |
| Shared | `whoosh.m4a`, `impact.m4a` (transitions), `sfx/*.m4a` (the cue-sound library) |

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

- **The pauses are cut.** `src/data/price-spans.json` holds the cut list —
  every gap over 0.35 s tightened to a 0.16 s breath, 8.6 s of dead air gone and
  66.0 s down to 57.5 s. One list serves both files: it is measured on the raw
  mp3 and applied to the mute take as well, so picture and sound are trimmed in
  lockstep. Regenerate with

  ```console
  SPANS_CUT_ABOVE=0.35 SPANS_KEEP=0.16 SPANS_HEAD_KEEP=0.12 \
    python3 scripts/build-spans-voice.py <raw.mp3> src/data/price-spans.json <ffmpeg>
  ```

  The camera never moves in this take, so each cut gets a small spring kick —
  a hard cut on a static frame reads as a glitch unless something acknowledges
  it. Measured at the fifteen edit points, the worst audio discontinuity is
  0.31× the local level; a click reads above about 8×.
- **Nothing holds a frame number.** Captions, cues and each panel's internal
  beats are all written in source seconds and mapped through `srcToFrame`, so
  re-cutting the spans moves them together. Panels receive an `at()` from
  `cueMark` and ask for their own beats — `at(12.35)` for the "un savoir-faire"
  stamp — rather than storing local frames that are only right for one version
  of the cut.
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
  Each lands on the words that carry it — the "un savoir-faire" stamp at 12.35 s,
  the electricity line at 46.55 s.
- The low-cost panel strikes **one** pillar, not three: he says a cheap salon
  removes *one* of these points, so the mark hunts across the three while he
  names them and locks onto the last. The first version crossed out all three,
  which says something he did not.
- **The CTA animation** gathers the four items onto a ring, dissolves them into
  a card and pulses a halo behind "prends rendez-vous". They stop on the ring
  instead of collapsing to a point — piling four labels on one spot made a blob.

### `Stories` — three client horror stories

Same data-driven shape as `Price` — a cut list plus an anchored transcript, both
in source seconds — with one structural difference: **the illustrations take the
whole frame** and alternate with the facecam instead of sharing the screen with
it. Seven scenes over 47 s, roughly half the reel; a full-screen graphic that
never gives the frame back stops illustrating the video and becomes it.

- **Sound was 27 dB down.** The camera mic put the speech at −36.6 dBFS with
  16.8 dB of SNR. A chain tuned for exactly that (a stronger denoiser told where
  the floor lands after the gain) measured *worse* than the existing `rescue`
  preset on both counts — 9.7 dB of SNR against 10.6, and 2.4 % of hiss above
  6 kHz against 0.3 % — so `rescue` is what ships and the tuned chain was
  dropped.
- **Getting to 40 s took tempo as well as cutting.** The take is tight — 6.1 s
  of silence in 49.6 s, none of it longer than 0.74 s — so even at 0.2 s → 0.08 s
  (4.2 s out, across 15 clips) it lands at 45 s. `RATE = 1.15` supplies the rest,
  the same mechanism as `Questions`: `buildClips` and `makeSrcToFrame` both take
  `FPS / RATE`, the video carries `playbackRate`, and the voice is retimed in its
  own file (`VOICE_TEMPO=1.15`, i.e. `atempo`, so the pitch is unchanged) and
  trimmed in that sped timebase. Verified the same way: all 15 clips within
  0.055 s of their predicted position, and two facecam frames matched back to the
  source land within 3 frames.
- **The hook is his own opening line**, split in three on its own word timings —
  "j'ai demandé à mes clients" to frame 26, "leurs pires souvenirs" to 47, "chez
  un barbier" to 65 — with the marker sweeping while he says "pires souvenirs".
  Anton, no card, no border. Captions start at frame 66, where the phrase ends.
- No opening fade, and each facecam clip carries a slow push, alternating
  direction, with a punchier kick on the cuts.
- **Scenes** (`components/illos/stories.tsx`): the head that loses its hair as he
  says "complètement rasé", −2 cm against 3× too short, a clock running two
  hours, a 14:00 appointment reached at 16:05, a struck-out speech bubble, the
  client's line against the barber's own version, and a comment field that types
  itself for the CTA.
- Two glyphs were redrawn after looking at them: the hair started as a band
  across the forehead, which read as a headband rather than a haircut, and the
  "he doesn't listen" ear read as a blob at every size tried, stroked or filled
  — a crossed-out speech bubble cannot be misread.
- **Scene titles are keyed to the wipe, not to a source second.** Keying them to
  a word left the CTA on screen and empty for about 15 frames, which reads as a
  black hole rather than a transition.
- `public/talk6.mp4` is the 89 MB original re-encoded to 35 MB at CRF 18
  (SSIM 0.994, PSNR 50.2 dB) so the repo stays in line with the other takes; the
  cut is rendered from that file, not from the original.

### `Questions` — the three "worst" questions

Same grammar as `Stories`, so the two share their scene kit
(`components/illos/scene-kit.tsx`: the titled full-frame card, the middle band,
the head, the beat helpers). What is specific here is the shape of the script —
three questions, each a card then an answer scene, and a CTA that carries the
twist, since the whole premise turns out to be a joke: there are no stupid
questions. The CTA strikes through "les pires questions" before the comment
field types itself.

- **The facecam gaps are enforced, not eyeballed.** `src/questions.ts` throws if
  fewer than 42 frames of facecam separate two scenes: a scene that leaves the
  frame and comes back half a second later reads as a flicker, not as a return
  to him. It caught a real one — 1.84 s of planned facecam collapsed to 1.33 s
  once the pause inside it was cut — which is exactly the kind of thing that is
  invisible in the source and obvious on screen.
- **Scenes**: growth bars that fill identically whether or not the hair is cut
  (with "couper évite juste la casse" as the nuance he actually gives), a crown
  seen from above with four zones and their follicle directions, and two clearly
  different heads under "similaire ≠ identique".
- The scalp scene started as a head beside a column of text, which left it small
  and stranded on one side, with the zones washed out at 50 % opacity over a
  colour they barely differed from. It is centred now, with the zones on the
  crown itself and the text under it.
- Sound was properly recorded this time (−20.3 LUFS, 21.4 dB of SNR), so it
  takes the `clean` chain rather than `rescue`.
- **Getting to 35 s took tempo, not just cutting.** The pauses in this take add
  up to 6.9 s all told, so tightening them as hard as they take (0.2 s → 0.08 s,
  4.8 s out across 16 clips) still lands at 40 s. The remaining 5 s come from
  `RATE = 1.16` in `src/questions.ts`: `buildClips` and `makeSrcToFrame` are both
  handed `FPS / RATE`, so clip lengths and caption timing stay in agreement, and
  the video track carries `playbackRate`. The voice is retimed in the file
  instead (`VOICE_TEMPO=1.16` on `build-voice.py`, which is `atempo`, so the
  pitch is unchanged) and trimmed in its own sped timebase — one checkable
  timebase rather than two mechanisms. Verified by cross-correlating each clip
  against its predicted position: all 16 within 0.06 s, no accumulating drift,
  and two facecam frames matched back to the source land within 3 frames.
- The opening fade is gone — frame 0 is the picture.
- **The hook is his own opening line**, word for word — phrase 0 of the
  transcript, split in three so each part springs in as he says it. The delays
  come from the same syllable-weighted word timing the captions use ("voici"
  0–7, "les pires questions" 7–26, the tail to 56), and the marker sweeps across
  exactly while he says "pires questions". Captions start at frame 57, where
  that phrase ends, so the hook *is* the caption for the opening line rather
  than a title card laid over it.
- **It is the one thing not set in Montserrat.** Anton — condensed, heavy,
  uppercase — reads as a different voice next to the captions, which is what a
  hook is for. No card and no border: it is held up by a warm bloom, a heavy
  face and a gold marker, with the words flipping to ink exactly as far as the
  bar has run (two copies of the line, the ink one clipped to the swipe).
- **It outlives the first question card**, holding 3.2 s, so the top of the frame
  is shared: the scene's index chip at 240, the hook at 320, the question card
  in the band from 640. Captions come back at frame 57 rather than waiting for
  the hook, since the first phrase is the hook said out loud.
- Each facecam clip carries a slow push, alternating in and out so two in a row
  never drift the same way. The camera never moves in this take, and a static
  frame under a fast cut reads as a freeze.

### `Style` — is the trending cut actually for you

The shortest of them: 26 s of take, 21 s once the pauses go. Same grammar as
`Stories` and `Questions` — scene kit, hook from his own opening line, no
opening fade, push on every facecam clip — with one thing they do not have.

- **He sent a clip to insert**, and it arrived as a phone screen recording of a
  TikTok. `scripts/prepare-broll.sh` crops the app chrome out — status bar,
  search field, engagement column, another creator's handle, comment box —
  leaving a 922×1640 window that is 9:16 exactly and centred on the face. It is
  muted rather than ducked: the original carries someone else's voice and music.
  A warm "la coupe en question" tag rides on it so the cut away from him reads
  as a citation rather than a jump.
- It lands on "cette coupe est partout", which is the one moment where showing
  the actual cut beats drawing anything.
- **No speed-up here.** The other two needed tempo to meet a length cap; this
  one is already short, so `RATE = 1` and the pauses do all the work.
- The two face shapes in the morphology scene are one ellipse with a varying
  ratio, and the cut is the whole skull in dark with the face laid over it below
  a straight fringe — drawn as a cap on top it read as a headband. The clip path
  ids have to be id-safe: keyed on the French labels, `url(#face-fin, allongé)`
  silently did nothing and both faces came out bald.

### `Errors` — the three he sees every day

Same grammar again; two things about this take shaped it.

- **He barely pauses.** `silencedetect` finds four segments across 31 s, two of
  them nearly twelve seconds long, which is useless for caption timing. The
  phrases come from a second pass at a 0.10 s threshold with each sub-phrase
  transcribed on its own — twelve of them instead of four.
- **He lists the three without stopping between them**, so scenes placed on his
  sentence boundaries left a third of a second of facecam between items. Each
  scene starts a beat into its item instead, which buys back a real window to
  him every time and still lands on the content. 61 % scene, five windows to
  camera.
- `clean` beat `rescue` on this one despite the take sitting at −28 LUFS: the
  heavier chain came back thin and hissy (26 % bass, 33 % high, 11 % air against
  41/19/4), so the balance decided it rather than the input level.
- **Getting to 25 s took tempo as well as cutting.** The take holds only 3.8 s
  of silence all told, so tightening to 0.15 s → 0.08 s (3.5 s out, 12 clips
  instead of 6) still lands at 28 s. `RATE = 1.13` supplies the rest, the same
  route as the other reels: `FPS / RATE` into `buildClips` and `makeSrcToFrame`,
  `playbackRate` on the video, and the voice retimed in its own file
  (`VOICE_TEMPO=1.13`) and trimmed in that timebase. Verified: all 12 clips
  place their audio within 0.06 s of prediction, and two facecam frames matched
  back to the source land within one frame.
- Twice as many clips is itself most of the extra pace; the scene cues moved a
  fraction to keep every facecam window over the 42-frame minimum.
- **The hook holds 4 s here**, longer than in the other reels, and overlaps the
  counter scene rather than clearing it. That is what the counter losing its
  title bought: it said "3 erreurs" under a hook already saying the same thing
  in Anton at twice the size. The counter and the wait scene both shifted later
  to make the room — at 25 s there was no way to have both a long hook and a
  counter card ahead of it.

#### A trap worth knowing

`AbsoluteFill` builds its style as `{...defaults, ...yours}` but the defaults
include `width: 100%` and `height: 100%`. Overriding `top` and `bottom` on one
therefore does *not* give you a band: `height` wins, `bottom` is ignored, and the
box runs a full frame height past its own top. That is what put every scene's
content ~550 px low, on top of the captions. Any element meant to occupy part of
the frame is a plain positioned `div` here, with an explicit height.

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
