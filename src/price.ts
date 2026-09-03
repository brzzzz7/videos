/**
 * The price reel (composition "Price").
 *
 * Picture and voice arrived as two files of the same length, already in sync,
 * so one cut list serves both: `price-spans.json` is measured on the raw mp3
 * and applied to the mute take as well, which trims image and sound in
 * lockstep.
 *
 * Everything downstream is expressed in SOURCE seconds and mapped through
 * `srcToFrame`, so re-cutting the spans moves the captions, the illustration
 * cues and each panel's internal beats together instead of desyncing them.
 */

import spansJson from "./data/price-spans.json";
export { sfxFile } from "./lib/sfx";
import {
  buildClips,
  groupLines,
  holdLines,
  makeSrcToFrame,
  normalise,
  timeWords,
  type Clip,
  type Line,
  type Word,
} from "./lib/captions";
import { cues, emphasis, phrases, type Cue } from "./data/price";

export const FPS = 30;
/**
 * The mute take runs 66.04 s and the mp3 66.06 s. The spans come from the mp3,
 * so the last one is clamped to the picture — 0.02 s of nothing to read.
 */
export const SOURCE_DURATION = 66.04;

const raw = spansJson.spans as [number, number][];
export const spans: [number, number][] = raw.map(([a, b]) => [
  a,
  Math.min(b, SOURCE_DURATION),
]);

export const clips: Clip[] = buildClips(spans, FPS);
export const totalFrames = clips.reduce((n, c) => n + c.durationInFrames, 0);

/** Source seconds -> timeline frame, collapsing the pauses that were cut. */
export const srcToFrame = makeSrcToFrame(clips, FPS);

/** Timeline frames where a jump cut lands, for the kick on the picture. */
export const cutFrames = clips.slice(1).map((c) => c.from);

/** Geometry of the split: the picture keeps the bottom half. */
export const SPLIT_LINE = 960;
/**
 * Which rows of the source fill the bottom half. He sits high in this take and
 * drifts down over the minute, so the window is chosen against frames sampled
 * across the whole clip rather than one still: at 760 his face stays inside the
 * half from the first second to the last, with headroom above and the captions
 * landing below his chin.
 */
export const BOTTOM_WINDOW_TOP = 760;
export const SPLIT_FRAMES = 9;

const hot = new Set(emphasis.map((w) => normalise(w)));

const lineList: Line[] = [];
for (const phrase of phrases) {
  const words: Word[] = timeWords(phrase, srcToFrame, hot);
  lineList.push(...groupLines(words, { maxWords: 5, maxChars: 34 }));
}
export const lines = holdLines(lineList, 8);

export type FrameCue = Omit<Cue, "at" | "until"> & {
  from: number;
  to: number;
};

export const frameCues: FrameCue[] = cues.map((cue) => ({
  illo: cue.illo,
  sfx: cue.sfx,
  from: srcToFrame(cue.at),
  to: srcToFrame(cue.until),
}));

// The brief is explicit: never the same sound twice in a row. Checked here so a
// later edit of the cue list cannot quietly break it.
frameCues.forEach((cue, i) => {
  const previous = frameCues[i - 1];
  if (previous && previous.sfx === cue.sfx) {
    throw new Error(
      `price: cue ${i} ("${cue.illo.kind}") repeats the sound "${cue.sfx}" ` +
        `right after cue ${i - 1} ("${previous.illo.kind}")`,
    );
  }
  if (previous && cue.from < previous.to) {
    throw new Error(
      `price: cue ${i} ("${cue.illo.kind}") starts before cue ${i - 1} ends`,
    );
  }
});

/**
 * How open the split is at a given frame: 0 = full frame, 1 = halves.
 *
 * The cues butt against each other, so in practice this opens once near the top
 * of the reel and stays open — it is still computed per cue so the opening and
 * the final close are driven by the cue list rather than hardcoded.
 */
export const splitAt = (frame: number): number => {
  let open = 0;
  for (const cue of frameCues) {
    const from = cue.from - SPLIT_FRAMES;
    const to = cue.to + SPLIT_FRAMES;
    if (frame < from || frame > to) continue;
    const opening = (frame - from) / SPLIT_FRAMES;
    const closing = (to - frame) / SPLIT_FRAMES;
    open = Math.max(open, Math.min(1, opening, closing));
  }
  return Math.max(0, open);
};

/**
 * Window a cue's panel occupies. Contiguous cues overlap by SPLIT_FRAMES at each
 * edge, which is what makes one illustration dissolve into the next instead of
 * swapping on a single frame.
 */
export const cueWindow = (cue: FrameCue) => ({
  from: Math.max(0, cue.from - SPLIT_FRAMES),
  durationInFrames: cue.to + SPLIT_FRAMES - Math.max(0, cue.from - SPLIT_FRAMES),
});

/**
 * Source seconds -> frames local to a cue's panel.
 *
 * Each illustration animates against the words underneath it, and those words
 * move when the cut list changes. Panels therefore ask for their own beats in
 * source seconds and get back a local frame, instead of holding frame numbers
 * that only happen to be right for one version of the cut.
 */
export const cueMark =
  (cue: FrameCue) =>
  (seconds: number): number =>
    srcToFrame(seconds) - cueWindow(cue).from;

export const ctaFrame = frameCues[frameCues.length - 1].from;
