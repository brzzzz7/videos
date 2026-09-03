import { interpolate } from "remotion";

export type RampPoint = [frame: number, value: number];

/**
 * Volume ramp that survives an edit getting shorter.
 *
 * `interpolate` throws if its input range is not strictly increasing, which is
 * exactly what happens when keyframes are written relative to a few different
 * anchors (end of speech, total length…) and one of them moves. Points are
 * clamped into order here instead, so trimming the edit can never break a
 * render.
 */
export const ramp = (frame: number, points: RampPoint[]): number => {
  const frames: number[] = [];
  const values: number[] = [];
  for (const [at, value] of points) {
    const previous = frames[frames.length - 1];
    const clamped = previous === undefined ? at : Math.max(at, previous + 1);
    frames.push(clamped);
    values.push(value);
  }
  if (frames.length === 1) return values[0];
  return interpolate(frame, frames, values, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};
