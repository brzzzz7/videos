/**
 * The morning-routine reel (composition "Morning").
 *
 * Unlike "Reel", this one is cut from pre-rendered shots: the source is 4K
 * vertical, so each shot was cropped out of it at a different framing
 * (scripts/cut-shots.py). Every shot carries handle frames at both ends, which
 * is what pays for the cross-dissolves.
 */

import {
  groupLines,
  holdLines,
  normalise,
  timeWords,
  type Line,
  type Word,
} from "./lib/captions";
import manifest from "./data/morning-shots.json";
import { copy, emphasis } from "./data/morning";

export const FPS = manifest.fps;
export const HANDLE = manifest.handleFrames;

/** Dissolve lengths, in frames. */
export const FADE_SECTION = 10;
export const FADE_CUT = 5;

export type Shot = {
  id: string;
  file: string;
  framing: "mid" | "med" | "close";
  /** timeline frame where this shot's audio starts */
  from: number;
  /** frames of audio (the spoken part) */
  frames: number;
  /** extra frames held on screen after the audio (last shot only) */
  tailFrames: number;
  /** source seconds, for the voice track */
  srcStart: number;
  srcEnd: number;
  /** frames of picture available before srcStart inside the shot file */
  head: number;
  fadeIn: number;
  label?: string;
  section: boolean;
};

const raw = manifest.shots;

export const shots: Shot[] = [];
{
  let cursor = 0;
  raw.forEach((shot, i) => {
    const text = copy[i];
    if (!text || text.id !== shot.id) {
      throw new Error(
        `morning: copy[${i}] is "${text?.id}" but shot is "${shot.id}"`,
      );
    }
    const frames = Math.round((shot.end - shot.start) * FPS);
    const tailFrames = Math.round(shot.tail * FPS);
    const fadeIn = i === 0 ? 0 : text.section ? FADE_SECTION : FADE_CUT;
    shots.push({
      id: shot.id,
      file: shot.file,
      framing: shot.framing as Shot["framing"],
      from: cursor,
      frames,
      tailFrames,
      srcStart: shot.start,
      srcEnd: shot.end,
      head: Math.round(shot.head * FPS),
      fadeIn,
      label: text.label,
      section: Boolean(text.section),
    });
    cursor += frames + tailFrames;
  });
}

export const totalFrames = shots.reduce(
  (n, s) => n + s.frames + s.tailFrames,
  0,
);

const hot = new Set(emphasis.map((w) => normalise(w)));

/** Captions: words of each shot spread across that shot's own duration. */
const lineList: Line[] = [];
shots.forEach((shot, i) => {
  const text = copy[i].text;
  // map the shot's source span onto its timeline span
  const srcToFrame = (seconds: number) =>
    shot.from +
    Math.round(
      ((seconds - shot.srcStart) / (shot.srcEnd - shot.srcStart)) * shot.frames,
    );
  const words: Word[] = timeWords(
    { start: shot.srcStart, end: shot.srcEnd, text },
    srcToFrame,
    hot,
  );
  lineList.push(...groupLines(words, { maxWords: 5, maxChars: 32 }));
});

export const lines = holdLines(lineList, 8);

/** Section labels, with the frame they appear on. */
export const labels = shots
  .filter((s) => s.label)
  .map((s) => ({ label: s.label as string, frame: s.from }));

export const hookFrames = shots[0].frames;
export const endCardFrame = shots[shots.length - 1].from + shots[shots.length - 1].frames;
