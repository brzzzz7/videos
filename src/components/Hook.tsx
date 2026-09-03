import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import { hook } from "../data/script";
import { DISPLAY, UI } from "../fonts";
import { shadow, stroke, theme } from "../theme";

export const HOOK_FRAMES = 66; // the first 2.2s carry the promise

/** Big opening promise: three staggered lines over a darkened frame. */
export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const out = interpolate(frame, [HOOK_FRAMES - 9, HOOK_FRAMES], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scrim = interpolate(frame, [0, 6, HOOK_FRAMES - 12, HOOK_FRAMES], [0.82, 0.66, 0.6, 0], {
    extrapolateRight: "clamp",
  });

  const kicker = spring({ frame, fps, config: { damping: 16, stiffness: 160 } });

  return (
    <AbsoluteFill style={{ opacity: 1 - out * 0.05 }}>
      <AbsoluteFill style={{ background: theme.ink, opacity: scrim }} />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          paddingLeft: theme.safe.side,
          paddingRight: theme.safe.side,
          transform: `translateY(${-out * 60}px) scale(${1 + out * 0.06})`,
          opacity: 1 - out,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 34,
            padding: "12px 22px",
            borderRadius: 999,
            background: theme.gold,
            transform: `translateY(${(1 - kicker) * -40}px) scale(${0.9 + kicker * 0.1})`,
            opacity: kicker,
          }}
        >
          <span
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: theme.ink,
            }}
          />
          <span
            style={{
              fontFamily: UI,
              fontWeight: 900,
              fontSize: 30,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: theme.ink,
            }}
          >
            {hook.kicker}
          </span>
        </div>

        {hook.lines.map((line, i) => {
          const enter = spring({
            frame: frame - 3 - i * 5,
            fps,
            config: { damping: 13, stiffness: 200, mass: 0.6 },
          });
          const gold = i === 0;
          return (
            <div
              key={i}
              style={{
                fontFamily: DISPLAY,
                fontSize: i === 0 ? 132 : 116,
                lineHeight: 1.0,
                letterSpacing: -1,
                color: gold ? theme.gold : theme.paper,
                textTransform: "uppercase",
                textAlign: "center",
                textShadow: shadow.text,
                ...stroke(gold ? 0 : 4, "rgba(0,0,0,0.75)"),
                transform: `translateY(${(1 - enter) * 70}px) scale(${
                  0.86 + enter * 0.14
                }) rotate(${(1 - enter) * (i % 2 ? 1.6 : -1.6)}deg)`,
                opacity: Math.min(1, enter * 1.8),
              }}
            >
              {line}
            </div>
          );
        })}

        <Underline frame={frame} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Underline: React.FC<{ frame: number }> = ({ frame }) => {
  const grow = interpolate(frame, [16, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        marginTop: 30,
        width: 520,
        height: 12,
        borderRadius: 999,
        background: `linear-gradient(90deg, ${theme.gold}, ${theme.punch})`,
        transform: `scaleX(${grow})`,
        transformOrigin: "left center",
      }}
    />
  );
};
