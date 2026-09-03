/**
 * The barbershop diagnostic reel (composition "Reel").
 *
 * Built from two inputs: the jump-cut spans (silence map of the source) and the
 * anchored transcript. Everything downstream — clips, word timings, chapter
 * cards, the CTA hand-off — is derived here, in frames.
 */

import {
  buildClips,
  groupLines,
  holdLines,
  makeSrcToFrame,
  normalise,
  timeWords,
  type Line,
  type Word,
} from "./lib/captions";
import spansData from "./data/spans.json";
import {
  CTA_SOURCE_START,
  chapters as chapterData,
  emphasis,
  phrases,
} from "./data/script";

export const FPS = 30;
export const CTA_TAIL_SECONDS = 3.8;

export type { Clip, Line, Word } from "./lib/captions";

const spans = spansData.spans as [number, number][];

export const clips = buildClips(spans, FPS);
export const speechFrames = clips.reduce((n, c) => n + c.durationInFrames, 0);
export const totalFrames = speechFrames + Math.round(CTA_TAIL_SECONDS * FPS);

export const srcToFrame = makeSrcToFrame(clips, FPS);

const hotSet = new Set(emphasis.map((w) => normalise(w)));

const lineList: Line[] = [];
for (const phrase of phrases) {
  const words: Word[] = timeWords(phrase, srcToFrame, hotSet);
  lineList.push(...groupLines(words, { maxWords: 3, maxChars: 19 }));
}

export const lines = holdLines(lineList, 10);

export const chapters = chapterData.map((c) => ({
  ...c,
  frame: srcToFrame(c.at),
}));

/** Frames where the framing should snap — every phrase start, plus each cut. */
export const punchFrames = Array.from(
  new Set([
    ...clips.map((c) => c.from),
    ...phrases.map((p) => srcToFrame(p.start)),
  ]),
).sort((a, b) => a - b);

export const ctaFrame = srcToFrame(CTA_SOURCE_START);
export const speechEndFrame = speechFrames;

/** The b-roll needs to cover the CTA cutaway plus the tail card. */
export const BROLL_SOURCE_START = 0.5;
