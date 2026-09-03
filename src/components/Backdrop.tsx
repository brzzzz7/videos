import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

import { theme } from "../theme";

/**
 * Lives behind the footage. Only fully visible when a clip is framed down,
 * so it stays cheap: gradients, no filters.
 */
export const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const blob = (x: number, y: number, size: number, color: string) => ({
    position: "absolute" as const,
    left: x - size / 2,
    top: y - size / 2,
    width: size,
    height: size,
    borderRadius: "50%",
    background: `radial-gradient(circle at 50% 50%, ${color} 0%, rgba(0,0,0,0) 70%)`,
  });

  return (
    <AbsoluteFill style={{ backgroundColor: theme.ink }}>
      <div
        style={blob(
          220 + Math.sin(t * 0.5) * 90,
          520 + Math.cos(t * 0.37) * 120,
          1200,
          "rgba(255,197,61,0.28)",
        )}
      />
      <div
        style={blob(
          900 + Math.cos(t * 0.42) * 110,
          1500 + Math.sin(t * 0.31) * 140,
          1300,
          "rgba(255,77,61,0.20)",
        )}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 1px, rgba(0,0,0,0) 1px 64px), repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 1px, rgba(0,0,0,0) 1px 64px)",
          backgroundPosition: `0 ${(t * 24) % 64}px`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 35%, rgba(0,0,0,0.75) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
