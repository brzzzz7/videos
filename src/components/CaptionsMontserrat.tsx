import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

import { SANS } from "../fonts";
import { theme } from "../theme";
import type { Line } from "../lib/captions";

/**
 * White Montserrat captions with a light shadow — enough to hold them off the
 * picture without turning into an outline. Words arrive a frame apart so a card
 * reads as one movement.
 */
export const CaptionsMontserrat: React.FC<{
  lines: Line[];
  size?: number;
  bottom?: number;
  hideBefore?: number;
}> = ({ lines, size = 62, bottom = 340, hideBefore = 0 }) => {
  const frame = useCurrentFrame();
  if (frame < hideBefore) return null;

  const line = lines.find((l) => frame >= l.from && frame <= l.to);
  if (!line) return null;

  const appear = interpolate(frame, [line.from, line.from + 5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const leave = interpolate(frame, [line.to - 3, line.to], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: bottom,
        paddingLeft: 88,
        paddingRight: 88,
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "4px 13px",
          fontFamily: SANS,
          fontWeight: 700,
          fontSize: size,
          lineHeight: 1.22,
          letterSpacing: -0.4,
          color: theme.paper,
          textAlign: "center",
          textShadow: "0 2px 8px rgba(0,0,0,0.45), 0 1px 2px rgba(0,0,0,0.35)",
          transform: `translateY(${(1 - appear) * 16 - leave * 6}px)`,
          opacity: appear * (1 - leave * 0.85),
        }}
      >
        {line.words.map((word, i) => (
          <span
            key={i}
            style={{
              color: word.hot ? theme.warm : theme.paper,
              opacity: interpolate(
                frame,
                [line.from + i, line.from + i + 4],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              ),
            }}
          >
            {word.text}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};
