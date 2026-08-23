/**
 * The questions reel (composition "Questions").
 *
 * Same shape as `Stories`: a cut list plus an anchored transcript, both in
 * source seconds and mapped through `srcToFrame`, with the illustrations taking
 * the full frame and alternating with the facecam.
 */

import spansJson from "./data/questions-spans.json";
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
import { cues, emphasis, phrases, type Cue, type Sfx } from "./data/questions";

export const FPS = 30;
export const SOURCE_DURATION = 45.09;

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
      `questions: cue ${i} ("${cue.scene.kind}") repeats the sound "${cue.sfx}" ` +
        `right after cue ${i - 1} ("${previous.scene.kind}")`,
    );
  }
  if (previous && cue.from < previous.to) {
    throw new Error(
      `questions: cue ${i} ("${cue.scene.kind}") starts before cue ${i - 1} ends`,
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
      `questions: only ${cue.from - previous.to} frames of facecam between cue ` +
        `${i - 1} ("${previous.scene.kind}") and cue ${i} ("${cue.scene.kind}")`,
    );
  }
});

export const sfxFile = (name: Sfx) => `sfx/${name}.m4a`;

/** Window a scene occupies, including the frames it wipes in and out over. */
export const cueWindow = (cue: FrameCue) => ({
  from: Math.max(0, cue.from - SCENE_FRAMES),
  durationInFrames: cue.to + SCENE_FRAMES - Math.max(0, cue.from - SCENE_FRAMES),
});

/** Source seconds -> frames local to a scene. */
export const cueMark =
  (cue: FrameCue) =>
  (seconds: number): number =>
    srcToFrame(seconds) - cueWindow(cue).from;

export const ctaFrame = frameCues[frameCues.length - 1].from;
