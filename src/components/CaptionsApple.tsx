import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
} from "remotion";

import { UI } from "../fonts";
import { theme } from "../theme";
import type { Line } from "../lib/captions";

/**
 * Apple-style captions: SF-like semibold, sentence case, no outline — just a
 * soft shadow to hold it off the picture. Lines fade and lift in, words follow
 * one frame apart so a card reads as one movement rather than a karaoke.
 */
export const CaptionsApple: React.FC<{
  lines: Line[];
  hideBefore?: number;
  hideAfter?: number;
  size?: number;
  bottom?: number;
}> = ({ lines, hideBefore = 0, hideAfter = Infinity, size = 68, bottom }) => {
  const frame = useCurrentFrame();
  if (frame < hideBefore || frame > hideAfter) return null;

  const line = lines.find((l) => frame >= l.from && frame <= l.to);
  if (!line) return null;

  const inProgress = interpolate(frame, [line.from, line.from + 5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const outProgress = interpolate(frame, [line.to - 3, line.to], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shift = (1 - inProgress) * 18 + outProgress * -8;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: bottom ?? theme.safe.bottom + 30,
        paddingLeft: 96,
        paddingRight: 96,
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "2px 14px",
          fontFamily: UI,
          fontWeight: 600,
          fontSize: size,
          lineHeight: 1.18,
          letterSpacing: -0.8,
          color: theme.paper,
          textAlign: "center",
          // the "légère ombre": enough to detach from the picture, not a stroke
          textShadow:
            "0 2px 10px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.45)",
          transform: `translateY(${shift}px)`,
          opacity: inProgress * (1 - outProgress * 0.9),
        }}
      >
        {line.words.map((word, i) => {
          const appear = interpolate(
            frame,
            [line.from + i, line.from + i + 4],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );
          return (
            <span
              key={i}
              style={{
                opacity: appear,
                color: word.hot ? theme.warm : theme.paper,
              }}
            >
              {word.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
