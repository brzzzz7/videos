/**
 * Shared caption maths for every reel in this project.
 *
 * A reel gives two things: the spans of the source it keeps (the cut list) and
 * a transcript anchored to source timestamps. From those we derive clips, word
 * timings (spread inside a phrase by syllable weight, so drift can never cross
 * a pause) and caption lines.
 */

export type Phrase = {
  start: number;
  end: number;
  text: string;
};

export type Clip = {
  /** timeline frame where the clip starts */
  from: number;
  durationInFrames: number;
  /** where to start reading the source, in seconds */
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

export const buildClips = (
  spans: [number, number][],
  fps: number,
): Clip[] => {
  const clips: Clip[] = [];
  let cursor = 0;
  for (const [start, end] of spans) {
    const durationInFrames = Math.max(1, Math.round((end - start) * fps));
    clips.push({ from: cursor, durationInFrames, srcFrom: start });
    cursor += durationInFrames;
  }
  return clips;
};

/** Source seconds -> timeline frame, collapsing whatever was cut out. */
export const makeSrcToFrame =
  (clips: Clip[], fps: number) =>
  (seconds: number): number => {
    const total = clips.reduce((n, c) => n + c.durationInFrames, 0);
    for (const clip of clips) {
      const srcEnd = clip.srcFrom + clip.durationInFrames / fps;
      if (seconds < clip.srcFrom) return clip.from;
      if (seconds <= srcEnd) {
        return clip.from + Math.round((seconds - clip.srcFrom) * fps);
      }
    }
    return total;
  };

const VOWELS = /[aeiouyàâäéèêëíîïóôöùûüœ]+/gi;

export const syllables = (word: string): number => {
  const groups = word.toLowerCase().match(VOWELS);
  return Math.max(1, groups ? groups.length : 1);
};

export const PUNCT_END = /[,:;.!?»]$/;

export const normalise = (word: string) =>
  word.replace(/[«»",:;.!?]/g, "").toLowerCase();

/** Words of a phrase, spread across its span by syllable weight. */
export const timeWords = (
  phrase: Phrase,
  srcToFrame: (seconds: number) => number,
  hot: Set<string>,
): Word[] => {
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
      hot: hot.has(normalise(text)),
    };
  });
};

export type GroupOptions = {
  maxWords: number;
  maxChars: number;
  /** break a line after a word that ends on punctuation */
  breakOnPunctuation?: boolean;
};

/** Group the words of one phrase into caption lines. */
export const groupLines = (words: Word[], opts: GroupOptions): Line[] => {
  const { maxWords, maxChars, breakOnPunctuation = true } = opts;
  const out: Line[] = [];
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
      current.length >= maxWords ||
      (current.length > 0 && chars + word.text.length > maxChars)
    ) {
      flush();
    }
    current.push(word);
    if (breakOnPunctuation && PUNCT_END.test(word.text)) flush();
  }
  flush();
  return out;
};

/** Hold each line until the next one arrives, so captions never flicker off. */
export const holdLines = (lines: Line[], maxHold: number): Line[] =>
  lines.map((line, i) => {
    const next = lines[i + 1];
    const gap = next ? next.from - line.to : maxHold;
    return { ...line, to: line.to + Math.min(Math.max(gap, 0), maxHold) };
  });
