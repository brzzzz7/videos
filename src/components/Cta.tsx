import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import { cta } from "../data/script";
import { DISPLAY, UI } from "../fonts";
import { shadow, stroke, theme } from "../theme";

/** End card over the barbershop b-roll, once the voice-over is done. */
export const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pop = (delay: number, stiffness = 180) =>
    spring({
      frame: frame - delay,
      fps,
      config: { damping: 14, stiffness, mass: 0.6 },
    });

  const scrim = interpolate(frame, [0, 14], [0, 0.62], {
    extrapolateRight: "clamp",
  });
  const title = pop(2);
  const line = pop(9);
  const button = pop(16, 150);
  const pulse = 1 + Math.sin(frame / 5) * 0.02;
  const swipe = interpolate(frame, [10, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, rgba(8,8,10,${scrim * 0.85}) 0%, rgba(8,8,10,${scrim * 0.45}) 45%, rgba(8,8,10,${scrim * 1.25}) 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          paddingLeft: theme.safe.side,
          paddingRight: theme.safe.side,
          paddingBottom: 120,
        }}
      >
        <div
          style={{
            fontFamily: UI,
            fontWeight: 900,
            fontSize: 30,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: theme.gold,
            marginBottom: 26,
            transform: `translateY(${(1 - pop(0)) * -30}px)`,
            opacity: pop(0),
          }}
        >
          {cta.chip}
        </div>

        <div
          style={{
            position: "relative",
            fontFamily: DISPLAY,
            fontSize: 150,
            lineHeight: 0.95,
            letterSpacing: -2,
            textTransform: "uppercase",
            color: theme.paper,
            textAlign: "center",
            textShadow: shadow.text,
            ...stroke(5, "rgba(0,0,0,0.7)"),
            transform: `translateY(${(1 - title) * 80}px) scale(${0.88 + title * 0.12})`,
            opacity: Math.min(1, title * 1.6),
          }}
        >
          {cta.title}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: -18,
              height: 14,
              borderRadius: 999,
              background: `linear-gradient(90deg, ${theme.gold}, ${theme.punch})`,
              transform: `scaleX(${swipe})`,
              transformOrigin: "left center",
            }}
          />
        </div>

        <div
          style={{
            marginTop: 62,
            fontFamily: UI,
            fontWeight: 700,
            fontSize: 46,
            lineHeight: 1.25,
            color: theme.paper,
            textAlign: "center",
            textShadow: shadow.text,
            transform: `translateY(${(1 - line) * 40}px)`,
            opacity: line,
          }}
        >
          {cta.line}
          <br />
          {cta.line2}
        </div>

        <div
          style={{
            marginTop: 58,
            display: "flex",
            alignItems: "center",
            gap: 18,
            padding: "26px 46px",
            borderRadius: 999,
            background: theme.gold,
            color: theme.ink,
            fontFamily: UI,
            fontWeight: 900,
            fontSize: 44,
            letterSpacing: 1,
            textTransform: "uppercase",
            boxShadow: `0 22px 60px rgba(255,197,61,0.35)`,
            transform: `translateY(${(1 - button) * 50}px) scale(${
              (0.9 + button * 0.1) * pulse
            })`,
            opacity: button,
          }}
        >
          Écris-moi « DIAG »
          <span style={{ fontSize: 52, lineHeight: 1 }}>→</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
