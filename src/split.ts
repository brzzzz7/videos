/**
 * The split-screen reel (composition "Split").
 *
 * The source arrived derushed, so there is no cut list: the reel is the clip end
 * to end. What is derived here is the caption timing and the illustration cues,
 * both in frames.
 */

import {
  groupLines,
  holdLines,
  normalise,
  timeWords,
  type Line,
  type Word,
} from "./lib/captions";
import { cues, emphasis, phrases, type Cue } from "./data/split";

export { sfxFile } from "./lib/sfx";

export const FPS = 30;
export const SOURCE_DURATION = 63.13;
export const totalFrames = Math.round(SOURCE_DURATION * FPS);

/** Geometry of the split: the picture keeps the bottom half. */
export const SPLIT_LINE = 960;
/**
 * Which rows of the source fill the bottom half: he sits low in the frame, so
 * the window starts here and runs 960 px down. The value is a compromise —
 * lower and he is centred but the captions land on his mouth, higher and he
 * drifts to the top of the half. Here his face sits in the middle of the half
 * with the captions clear of it, on his collar.
 */
export const BOTTOM_WINDOW_TOP = 680;
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
      `split: cue ${i} ("${cue.illo.kind}") repeats the sound "${cue.sfx}" ` +
        `right after cue ${i - 1} ("${previous.illo.kind}")`,
    );
  }
  if (previous && cue.from < previous.to) {
    throw new Error(
      `split: cue ${i} ("${cue.illo.kind}") starts before cue ${i - 1} ends`,
    );
  }
});

/**
 * How open the split is at a given frame: 0 = full frame, 1 = halves.
 *
 * Taken as the maximum over every cue, so two cues that follow each other
 * without a gap keep the panel open instead of collapsing it for a few frames
 * and snapping it back.
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

/** Window a cue's panel occupies, including its fade in and out. */
export const cueWindow = (cue: FrameCue) => ({
  from: Math.max(0, cue.from - SPLIT_FRAMES),
  durationInFrames: cue.to + SPLIT_FRAMES - Math.max(0, cue.from - SPLIT_FRAMES),
});

export const ctaFrame = frameCues[frameCues.length - 1].from;
