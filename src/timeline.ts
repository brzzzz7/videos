/**
 * Builds the edit from two inputs: the jump-cut spans (silence map of the
 * source) and the anchored transcript. Everything downstream — clips, word
 * timings, chapter cards, the CTA hand-off — is derived here, in frames.
 */

import spansData from "./data/spans.json";
import {
  CTA_SOURCE_START,
  chapters as chapterData,
  emphasis,
  phrases,
} from "./data/script";

export const FPS = 30;
export const CTA_TAIL_SECONDS = 3.8;

export type Clip = {
  /** timeline frame where the clip starts */
  from: number;
  durationInFrames: number;
  /** where to start reading talk.mp4, in seconds */
  srcFrom: number;
};

export type Word = {
  text: string;
  from: number;
  to: number;
  hot: boolean;
};

export type Line = {
  words: Word[];
  from: number;
  to: number;
};

const spans = spansData.spans as [number, number][];

const clipList: Clip[] = [];
{
  let cursor = 0;
  for (const [start, end] of spans) {
    const durationInFrames = Math.max(1, Math.round((end - start) * FPS));
    clipList.push({ from: cursor, durationInFrames, srcFrom: start });
    cursor += durationInFrames;
  }
}

export const clips = clipList;
export const speechFrames = clips.reduce((n, c) => n + c.durationInFrames, 0);
export const totalFrames = speechFrames + Math.round(CTA_TAIL_SECONDS * FPS);

/** Source seconds -> timeline frame, collapsing the cut-out dead air. */
export const srcToFrame = (seconds: number): number => {
  for (const clip of clips) {
    const srcEnd = clip.srcFrom + clip.durationInFrames / FPS;
    if (seconds < clip.srcFrom) return clip.from;
    if (seconds <= srcEnd) {
      return clip.from + Math.round((seconds - clip.srcFrom) * FPS);
    }
  }
  return speechFrames;
};

const VOWELS = /[aeiouyàâäéèêëíîïóôöùûüœ]+/gi;
const syllables = (word: string) => {
  const groups = word.toLowerCase().match(VOWELS);
  return Math.max(1, groups ? groups.length : 1);
};

const PUNCT_END = /[,:;.!?»]$/;
const clean = (word: string) => word.replace(/[«»",:;.!?]/g, "").toLowerCase();
const hotSet = new Set(emphasis.map((w) => clean(w)));

/** Words of a phrase, spread across its span by syllable weight. */
const timeWords = (phrase: (typeof phrases)[number]): Word[] => {
  const tokens = phrase.text.split(/\s+/).filter(Boolean);
  const weights = tokens.map(
    (t) => syllables(t) + 0.4 + (PUNCT_END.test(t) ? 0.9 : 0),
  );
  const total = weights.reduce((a, b) => a + b, 0);
  const span = phrase.end - phrase.start;

  let acc = 0;
  return tokens.map((text, i) => {
    const from = phrase.start + (acc / total) * span;
    acc += weights[i];
    const to = phrase.start + (acc / total) * span;
    return {
      text,
      from: srcToFrame(from),
      to: srcToFrame(to),
      hot: hotSet.has(clean(text)),
    };
  });
};

const MAX_WORDS = 3;
const MAX_CHARS = 19;

/** Group words into short, punchy caption lines. */
const buildLines = (): Line[] => {
  const out: Line[] = [];
  for (const phrase of phrases) {
    const words = timeWords(phrase);
    let current: Word[] = [];
    const flush = () => {
      if (!current.length) return;
      out.push({
        words: current,
        from: current[0].from,
        to: current[current.length - 1].to,
      });
      current = [];
    };
    for (const word of words) {
      const chars = current.reduce((n, w) => n + w.text.length + 1, 0);
      if (
        current.length >= MAX_WORDS ||
        (current.length > 0 && chars + word.text.length > MAX_CHARS)
      ) {
        flush();
      }
      current.push(word);
      if (PUNCT_END.test(word.text)) flush();
    }
    flush();
  }

  // hold each line until the next one arrives, so captions never flicker off
  return out.map((line, i) => {
    const next = out[i + 1];
    const gap = next ? next.from - line.to : 12;
    return { ...line, to: line.to + Math.min(Math.max(gap, 0), 10) };
  });
};

export const lines = buildLines();

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
