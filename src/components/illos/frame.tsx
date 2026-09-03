import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

import { SANS } from "../../fonts";
import { theme } from "../../theme";

/** Shared look for every illustration in the top half of the split. */
export const IlloFrame: React.FC<{
  title?: string;
  children: React.ReactNode;
}> = ({ title, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 22, stiffness: 120 } });

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(120% 90% at 18% 12%, rgba(255,201,138,0.16) 0%, rgba(12,12,16,0) 55%), linear-gradient(180deg, #0C0C10 0%, #14120F 100%)",
        overflow: "hidden",
      }}
    >
      {/* faint grid, so the panel reads as a designed surface, not a black box */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.045) 0 1px, rgba(0,0,0,0) 1px 72px), repeating-linear-gradient(90deg, rgba(255,255,255,0.045) 0 1px, rgba(0,0,0,0) 1px 72px)",
          opacity: interpolate(enter, [0, 1], [0, 1]),
        }}
      />
      {title ? (
        <div
          style={{
            position: "absolute",
            top: 54,
            left: 64,
            right: 64,
            fontFamily: SANS,
            fontWeight: 700,
            fontSize: 34,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: theme.warm,
            opacity: interpolate(frame, [2, 12], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          {title}
        </div>
      ) : null}
      <AbsoluteFill
        style={{
          // the panel is only half the screen on a phone: the content is scaled
          // up so a gauge or a label still reads at arm's length
          transform: `translateY(${(1 - enter) * 26}px) scale(${1.18})`,
          opacity: Math.min(1, enter * 1.4),
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const label = (size = 34, weight = 600) =>
  ({
    fontFamily: SANS,
    fontWeight: weight,
    fontSize: size,
    color: theme.paper,
    letterSpacing: 0.2,
  }) as const;
