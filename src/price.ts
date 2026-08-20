/**
 * The price reel (composition "Price").
 *
 * Picture and voice arrived as two files of the same length, already in sync,
 * so there is no cut list: the reel is the clip end to end. What is derived
 * here is the caption timing and the illustration cues, both in frames.
 */

import {
  groupLines,
  holdLines,
  normalise,
  timeWords,
  type Line,
  type Word,
} from "./lib/captions";
import { cues, emphasis, phrases, type Cue, type Sfx } from "./data/price";

export const FPS = 30;
export const SOURCE_DURATION = 66.04;
export const totalFrames = Math.round(SOURCE_DURATION * FPS);

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

const secondsToFrame = (seconds: number) => Math.round(seconds * FPS);

const hot = new Set(emphasis.map((w) => normalise(w)));

const lineList: Line[] = [];
for (const phrase of phrases) {
  const words: Word[] = timeWords(phrase, secondsToFrame, hot);
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
  from: secondsToFrame(cue.at),
  to: secondsToFrame(cue.until),
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

export const sfxFile = (name: Sfx) => `sfx/${name}.m4a`;

/**
 * How open the split is at a given frame: 0 = full frame, 1 = halves.
 *
 * The cues here butt against each other, so in practice this opens once near
 * the top of the reel and stays open — it is still computed per cue so the
 * opening and the final close are driven by the cue list rather than hardcoded.
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

export const ctaFrame = frameCues[frameCues.length - 1].from;
