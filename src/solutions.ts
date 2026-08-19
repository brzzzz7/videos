/**
 * The hair-loss reel (composition "Solutions").
 *
 * A voice recording with no camera: pauses were tightened freely (nothing to
 * keep in sync), and the scenes are generated against the tightened timeline.
 * Everything below is derived from two files — the span list and the anchored
 * transcript.
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
import spansData from "./data/solutions-spans.json";
import {
  accents,
  emphasis,
  phrases,
  scenes as sceneData,
  type Scene,
  type Sfx,
} from "./data/solutions";

export const FPS = 30;
export const CTA_TAIL_SECONDS = 2.6;

const spans = spansData.spans as [number, number][];

export const clips = buildClips(spans, FPS);
export const speechFrames = clips.reduce((n, c) => n + c.durationInFrames, 0);
export const totalFrames = speechFrames + Math.round(CTA_TAIL_SECONDS * FPS);

export const srcToFrame = makeSrcToFrame(clips, FPS);

const hot = new Set(emphasis.map((w) => normalise(w)));

const lineList: Line[] = [];
for (const phrase of phrases) {
  const words: Word[] = timeWords(phrase, srcToFrame, hot);
  lineList.push(...groupLines(words, { maxWords: 5, maxChars: 34 }));
}
export const lines = holdLines(lineList, 8);

export type FrameScene = {
  scene: Scene;
  from: number;
  durationInFrames: number;
};

/** Scenes run back to back and cover the whole reel: there is no b-roll under. */
export const frameScenes: FrameScene[] = sceneData.map((entry, i) => {
  const from = i === 0 ? 0 : srcToFrame(entry.at);
  const next = sceneData[i + 1];
  const to = next ? srcToFrame(next.at) : totalFrames;
  return { scene: entry.scene, from, durationInFrames: Math.max(1, to - from) };
});

export const ctaFrame = frameScenes[frameScenes.length - 1].from;

/** Every cue sound in order: one per scene, plus the accents inside them. */
export const cueSounds: { frame: number; sfx: Sfx }[] = [
  ...sceneData.map((entry, i) => ({
    frame: i === 0 ? 0 : srcToFrame(entry.at),
    sfx: entry.sfx,
  })),
  ...accents.map((accent) => ({ frame: srcToFrame(accent.at), sfx: accent.sfx })),
].sort((a, b) => a.frame - b.frame);

// The brief is explicit: never the same sound twice in a row. Checked here so a
// later edit of the cue list cannot quietly break it.
cueSounds.forEach((cue, i) => {
  const previous = cueSounds[i - 1];
  if (previous && previous.sfx === cue.sfx) {
    throw new Error(
      `solutions: cue at frame ${cue.frame} repeats "${cue.sfx}" right after ` +
        `the cue at frame ${previous.frame}`,
    );
  }
});

export const sfxFile = (name: Sfx) => `sfx/${name}.m4a`;
