import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import { chapters } from "../timeline";
import { DISPLAY, UI } from "../fonts";
import { shadow, theme } from "../theme";

const HOLD = 46;

/** The "01 — Le cuir chevelu" band that slams in on each new point. */
const Card: React.FC<{ index: string; label: string }> = ({ index, label }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 170, mass: 0.7 },
  });
  const exit = spring({
    frame: frame - HOLD,
    fps,
    config: { damping: 20, stiffness: 130 },
  });
  const x = (1 - enter) * -900 + exit * 1100;
  const flash = interpolate(frame, [0, 2, 5], [0.5, 0.18, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: theme.paper, opacity: flash }} />
      <div
        style={{
          position: "absolute",
          top: 470,
          left: 0,
          display: "flex",
          alignItems: "stretch",
          transform: `translateX(${x}px) skewX(-7deg)`,
          boxShadow: shadow.card,
        }}
      >
        <div
          style={{
            background: theme.gold,
            color: theme.ink,
            fontFamily: DISPLAY,
            fontSize: 104,
            lineHeight: 1,
            padding: "18px 26px 14px",
            display: "flex",
            alignItems: "center",
          }}
        >
          {index}
        </div>
        <div
          style={{
            background: theme.ink,
            color: theme.paper,
            fontFamily: UI,
            fontWeight: 900,
            fontSize: 54,
            letterSpacing: 1,
            textTransform: "uppercase",
            padding: "0 40px 0 32px",
            display: "flex",
            alignItems: "center",
            borderTop: `4px solid ${theme.gold}`,
            borderBottom: `4px solid ${theme.gold}`,
          }}
        >
          {label}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const ChapterCards: React.FC = () => (
  <>
    {chapters.map((chapter) => (
      <Sequence
        key={chapter.index}
        from={chapter.frame - 4}
        durationInFrames={HOLD + 26}
        layout="none"
      >
        <Card index={chapter.index} label={chapter.label} />
      </Sequence>
    ))}
  </>
);
