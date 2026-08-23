import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import { SANS } from "../../fonts";
import { theme } from "../../theme";

/* ------------------------------------------------------------------ helpers */

/*
 * The kit the full-screen reels are built from. Shared by `Stories` and
 * `Questions`, which use the same grammar: a titled full-frame card, a middle
 * band for the drawing, and beats given in source seconds.
 */

export const RED = "#FF6B5A";
export const GREEN = "#7BD88F";

/** The band a scene may draw in: under the title block, clear of the captions. */
export const STAGE_TOP = 640;
export const STAGE_BOTTOM = 1440;

/**
 * Scenes take the whole frame here, so their beats are given in SOURCE seconds
 * and converted by `at` (from `cueMark` in stories.ts). Holding local frame
 * numbers would desync every scene the moment the cut list changed.
 */
export type Beat = { at: (seconds: number) => number };

export const text = (size: number, weight = 600, color: string = theme.paper) =>
  ({
    fontFamily: SANS,
    fontWeight: weight,
    fontSize: size,
    color,
    letterSpacing: -0.6,
  }) as const;

export const useSpring = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (delay: number, ramp = 1) =>
    spring({
      frame: frame - delay,
      fps,
      config: { damping: 20, stiffness: 120 * ramp, mass: 0.6 },
    });
};

export const fade = (frame: number, at: number, over = 10) =>
  interpolate(frame, [at, at + over], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

/** Full-frame background shared by every scene. */
export const SceneFrame: React.FC<{
  index?: string;
  title?: string;
  children?: React.ReactNode;
}> = ({ index, title, children }) => {
  const frame = useCurrentFrame();
  const grow = useSpring();
  const drift = interpolate(frame, [0, 600], [0, 30], { extrapolateRight: "clamp" });
  // 3, not a source second: the title has to be there the moment the scene
  // wipes in, or the frame reads as a black hole for a beat.
  const p = grow(3);

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(110% 70% at 20% 8%, rgba(255,201,138,0.18) 0%, rgba(10,10,13,0) 58%), linear-gradient(180deg, #0B0B0E 0%, #16130F 100%)",
        overflow: "hidden",
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, rgba(0,0,0,0) 1px 76px), repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0 1px, rgba(0,0,0,0) 1px 76px)",
          backgroundPosition: `0 ${drift}px`,
        }}
      />
      {index || title ? (
        <div
          style={{
            position: "absolute",
            top: 240,
            left: 70,
            right: 70,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 22,
            opacity: p,
            transform: `translateY(${(1 - p) * -24}px)`,
          }}
        >
          {index ? (
            <div
              style={{
                ...text(30, 700, "#171310"),
                background: theme.warm,
                padding: "10px 24px",
                borderRadius: 999,
                letterSpacing: 3,
                textTransform: "uppercase",
              }}
            >
              {index}
            </div>
          ) : null}
          {title ? (
            <div style={{ ...text(78, 700), textAlign: "center", lineHeight: 1.08 }}>
              {title}
            </div>
          ) : null}
        </div>
      ) : null}
      {children}
    </AbsoluteFill>
  );
};

/**
 * The middle band, below the title block and above the captions.
 *
 * Deliberately a plain div, not an AbsoluteFill: AbsoluteFill sets
 * `height: 100%` before spreading the caller's style, so a `bottom` override is
 * silently ignored and the box runs a full frame height past its own top —
 * which put every scene's content ~550 px low, on top of the captions.
 */
export const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      position: "absolute",
      top: STAGE_TOP,
      left: 0,
      right: 0,
      height: STAGE_BOTTOM - STAGE_TOP,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    {children}
  </div>
);

/**
 * A head whose hair is one shape over the skull: `hair` is how far the outer
 * silhouette rises above the scalp, so 1 is a full head of it and 0.06 is
 * stubble hugging the skull. The first version varied a band across the
 * forehead instead, which read as a headband rather than a haircut.
 */
export const Head: React.FC<{ hair: number; tint?: string }> = ({ hair, tint = "#D8A87A" }) => {
  const apex = 60 - hair * 76;   // the scalp sits at y = 60

  return (
    <svg width="620" height="654" viewBox="0 0 360 380">
      <path d="M40 380 Q60 296 180 292 Q300 296 320 380 Z" fill="rgba(255,255,255,0.14)" />
      <ellipse cx="180" cy="182" rx="104" ry="122" fill={tint} />
      <ellipse cx="272" cy="196" rx="18" ry="26" fill={tint} />
      <path
        d={`M74 172 Q180 ${apex} 286 172 Q180 74 74 172 Z`}
        fill="#4A3526"
        opacity={0.4 + hair * 0.6}
      />
    </svg>
  );
};

