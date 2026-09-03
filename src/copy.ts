/**
 * The "no copy-paste" reel (composition "Copy").
 *
 * Same data-driven shape as the Price reel: a cut list plus a transcript
 * anchored to source seconds. Everything downstream — captions, scene cues,
 * each scene's internal beats — is written in source seconds and mapped through
 * `srcToFrame`, so re-cutting the spans moves the whole reel together.
 *
 * What differs is the geometry: the illustrations take the full frame and
 * alternate with the facecam, rather than sharing the screen with it.
 */

import spansJson from "./data/copy-spans.json";
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
import { cues, emphasis, phrases, type Cue } from "./data/copy";

export const FPS = 30;
export const SOURCE_DURATION = 28.86;

/**
 * No speed-up. He asked for none here, and 28.9 s comes in at 26.6 s on
 * pause-cutting alone.
 */
export const RATE = 1;

/**
 * Frames advance RATE source frames each, so every source-second mapping runs
 * at this rate rather than at FPS. Passing it to both `buildClips` and
 * `makeSrcToFrame` is what keeps clip lengths and the caption timing agreeing.
 */
const PLAY_FPS = FPS / RATE;

const raw = spansJson.spans as [number, number][];
export const spans: [number, number][] = raw.map(([a, b]) => [
  a,
  Math.min(b, SOURCE_DURATION),
]);

export const clips: Clip[] = buildClips(spans, PLAY_FPS);
export const totalFrames = clips.reduce((n, c) => n + c.durationInFrames, 0);

/** Source seconds -> timeline frame, collapsing the pauses that were cut. */
export const srcToFrame = makeSrcToFrame(clips, PLAY_FPS);

/** Timeline frames where a jump cut lands, for the kick on the picture. */
export const cutFrames = clips.slice(1).map((c) => c.from);

/** Frames a scene takes to wipe in and out over the facecam. */
export const SCENE_FRAMES = 8;

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
  scene: cue.scene,
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
      `copy: cue ${i} ("${cue.scene.kind}") repeats the sound "${cue.sfx}" ` +
        `right after cue ${i - 1} ("${previous.scene.kind}")`,
    );
  }
  if (previous && cue.from < previous.to) {
    throw new Error(
      `copy: cue ${i} ("${cue.scene.kind}") starts before cue ${i - 1} ends`,
    );
  }
});

// A scene that leaves the frame and comes back a few frames later reads as a
// flicker, not as a return to him. 42 frames is the shortest gap that reads.
const MIN_FACECAM = 42;
frameCues.forEach((cue, i) => {
  const previous = frameCues[i - 1];
  if (previous && cue.from - previous.to < MIN_FACECAM) {
    throw new Error(
      `copy: only ${cue.from - previous.to} frames of facecam between cue ` +
        `${i - 1} ("${previous.scene.kind}") and cue ${i} ("${cue.scene.kind}")`,
    );
  }
});

/** Window a scene occupies, including the frames it wipes in and out over. */
export const cueWindow = (cue: FrameCue) => ({
  from: Math.max(0, cue.from - SCENE_FRAMES),
  durationInFrames: cue.to + SCENE_FRAMES - Math.max(0, cue.from - SCENE_FRAMES),
});

/**
 * Source seconds -> frames local to a scene.
 *
 * Scenes animate against the words underneath them, and those words move when
 * the cut list changes, so a scene asks for its beats in source seconds rather
 * than holding frame numbers that are only right for one version of the cut.
 */
export const cueMark =
  (cue: FrameCue) =>
  (seconds: number): number =>
    srcToFrame(seconds) - cueWindow(cue).from;

export const ctaFrame = frameCues[frameCues.length - 1].from;
