import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import { chapters, ctaFrame, totalFrames } from "../timeline";
import { UI } from "../fonts";
import { theme } from "../theme";

/** Progress bar + the "which point are we on" pill. */
export const Hud: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = interpolate(frame, [0, totalFrames], [0, 1], {
    extrapolateRight: "clamp",
  });
  // the end card owns the screen from the cutaway on
  const fade = interpolate(frame, [ctaFrame - 10, ctaFrame + 8], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const current = chapters.filter((c) => frame >= c.frame).pop();
  const enter = current
    ? spring({
        frame: frame - current.frame,
        fps,
        config: { damping: 16, stiffness: 150 },
      })
    : 0;

  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: fade }}>
      <div
        style={{
          position: "absolute",
          top: 46,
          left: theme.safe.side,
          right: theme.safe.side,
          height: 8,
          borderRadius: 999,
          background: "rgba(255,255,255,0.18)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progress * 100}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${theme.gold}, ${theme.punch})`,
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          top: 82,
          left: theme.safe.side,
          display: "flex",
          gap: 10,
        }}
      >
        {chapters.map((c) => {
          const done = frame >= c.frame;
          return (
            <div
              key={c.index}
              style={{
                width: done ? 34 : 12,
                height: 12,
                borderRadius: 999,
                background: done ? theme.gold : "rgba(255,255,255,0.3)",
              }}
            />
          );
        })}
      </div>

      {current ? (
        <div
          style={{
            position: "absolute",
            top: 74,
            right: theme.safe.side,
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 18px",
            borderRadius: 999,
            background: "rgba(8,8,10,0.72)",
            border: `2px solid ${theme.gold}`,
            transform: `translateX(${(1 - enter) * 60}px)`,
            opacity: enter,
          }}
        >
          <span
            style={{
              fontFamily: UI,
              fontWeight: 900,
              fontSize: 26,
              color: theme.gold,
              letterSpacing: 2,
            }}
          >
            {current.index}
          </span>
          <span
            style={{
              fontFamily: UI,
              fontWeight: 700,
              fontSize: 26,
              color: theme.paper,
              letterSpacing: 1.5,
              textTransform: "uppercase",
            }}
          >
            {current.label}
          </span>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
