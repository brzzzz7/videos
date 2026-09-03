import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import { lines, type Word } from "../timeline";
import { DISPLAY } from "../fonts";
import { shadow, stroke, theme } from "../theme";

const SIZE = 100;

/** Marker swipe behind the word being said. */
const Highlight: React.FC<{ progress: number }> = ({ progress }) => (
  <span
    style={{
      position: "absolute",
      left: -14,
      right: -14,
      top: 8,
      bottom: 10,
      background: theme.gold,
      transform: `scaleX(${progress}) skewX(-8deg)`,
      transformOrigin: "left center",
      borderRadius: 6,
      zIndex: 0,
    }}
  />
);

const Token: React.FC<{ word: Word; lineFrom: number; index: number }> = ({
  word,
  lineFrom,
  index,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pop = spring({
    frame: frame - lineFrom - index * 2,
    fps,
    config: { damping: 13, stiffness: 220, mass: 0.5 },
  });
  const active = frame >= word.from && frame <= word.to;
  const swipe = active
    ? interpolate(frame, [word.from, word.from + 2], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;
  // only flip to dark type once the marker is actually behind the word
  const marked = swipe > 0.55;
  const lift = active ? 1 : 0;

  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        padding: "0 6px",
        transform: `translateY(${(1 - pop) * 34 - lift * 6}px) scale(${
          (0.82 + pop * 0.18) * (1 + lift * 0.05)
        })`,
        opacity: Math.min(1, pop * 1.6),
      }}
    >
      {active ? <Highlight progress={swipe} /> : null}
      <span
        style={{
          position: "relative",
          zIndex: 1,
          color: marked ? theme.ink : word.hot ? theme.gold : theme.paper,
          ...stroke(marked ? 0 : 9),
          textShadow: marked ? "none" : shadow.text,
        }}
      >
        {word.text.toUpperCase()}
      </span>
    </span>
  );
};

export const Subtitles: React.FC<{ hideBefore?: number }> = ({
  hideBefore = 0,
}) => {
  const frame = useCurrentFrame();
  if (frame < hideBefore) return null;

  const line = lines.find((l) => frame >= l.from && frame <= l.to);
  if (!line) return null;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: theme.safe.bottom + 110,
        paddingLeft: theme.safe.side,
        paddingRight: theme.safe.side,
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "flex-end",
          gap: "0 4px",
          fontFamily: DISPLAY,
          fontSize: SIZE,
          lineHeight: 1.04,
          letterSpacing: 0.5,
          textAlign: "center",
        }}
      >
        {line.words.map((word, i) => (
          <Token key={i} word={word} lineFrom={line.from} index={i} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
