import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import "./fonts";
import { CaptionsMontserrat } from "./components/CaptionsMontserrat";
import { SANS } from "./fonts";
import { Grain, Vignette } from "./components/Grain";
import {
  Charges,
  CtaPrice,
  Formation,
  LowCost,
  Material,
  PriceTag,
  ProductsCompare,
  Saving,
  Time,
} from "./components/illos/price";
import { ramp } from "./lib/audio";
import type { Illo } from "./data/price";
import { hook } from "./data/price";
import {
  BOTTOM_WINDOW_TOP,
  ctaFrame,
  cueWindow,
  frameCues,
  lines,
  sfxFile,
  SPLIT_FRAMES,
  SPLIT_LINE,
  splitAt,
  totalFrames,
} from "./price";
import { theme } from "./theme";

const Illustration: React.FC<{ illo: Illo }> = ({ illo }) => {
  switch (illo.kind) {
    case "tag":
      return <PriceTag />;
    case "formation":
      return <Formation />;
    case "material":
      return <Material />;
    case "products":
      return <ProductsCompare />;
    case "time":
      return <Time />;
    case "saving":
      return <Saving />;
    case "charges":
      return <Charges />;
    case "lowcost":
      return <LowCost />;
    case "cta":
      return <CtaPrice />;
  }
};

/**
 * The picture keeps the bottom half. The window slides down to
 * BOTTOM_WINDOW_TOP as the split opens, so his face stays framed inside that
 * half rather than being pushed out of it.
 */
const Stage: React.FC = () => {
  const frame = useCurrentFrame();
  const open = splitAt(frame);
  const clipTop = SPLIT_LINE * open;
  // The window must show source rows BOTTOM_WINDOW_TOP..+960 inside the bottom
  // half, so the picture's top edge sits at (SPLIT_LINE - BOTTOM_WINDOW_TOP).
  const videoTop = (SPLIT_LINE - BOTTOM_WINDOW_TOP) * open;

  return (
    <div
      style={{
        position: "absolute",
        top: clipTop,
        left: 0,
        width: theme.width,
        height: theme.height - clipTop,
        overflow: "hidden",
      }}
    >
      <OffthreadVideo
        src={staticFile("talk5.mp4")}
        muted
        toneMapped={false}
        style={{
          position: "absolute",
          top: videoTop - clipTop,
          left: 0,
          width: theme.width,
          height: theme.height,
          objectFit: "cover",
        }}
      />
    </div>
  );
};

/** The illustration panel, revealed above the picture. */
const Panel: React.FC = () => {
  const frame = useCurrentFrame();
  const open = splitAt(frame);
  if (open <= 0.001) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: theme.width,
        height: SPLIT_LINE,
        overflow: "hidden",
        transform: `translateY(${(open - 1) * 60}px)`,
        opacity: Math.min(1, open * 1.6),
      }}
    >
      {/* every cue owns its own sequence: the cues butt against each other, so
          the overlap at the edges is what dissolves one panel into the next */}
      {frameCues.map((cue, i) => (
        <Sequence key={`illo-${i}`} {...cueWindow(cue)} layout="none">
          <IlloFade length={cue.to + SPLIT_FRAMES - (cue.from - SPLIT_FRAMES)}>
            <Illustration illo={cue.illo} />
          </IlloFade>
        </Sequence>
      ))}
      {/* hairline where the two halves meet */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 3,
          background: `linear-gradient(90deg, rgba(255,201,138,0), ${theme.warm}, rgba(255,201,138,0))`,
          opacity: open,
        }}
      />
    </div>
  );
};

const IlloFade: React.FC<{ length: number; children: React.ReactNode }> = ({
  length,
  children,
}) => {
  const frame = useCurrentFrame();
  const alpha =
    interpolate(frame, [0, 6], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }) *
    interpolate(frame, [length - 6, length], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  return <AbsoluteFill style={{ opacity: alpha }}>{children}</AbsoluteFill>;
};

export const HOOK_FRAMES = 63;   // 2.1 s

/**
 * Opening promise, over the first two seconds. It sits across the whole frame
 * with a scrim, so the panel and the facecam both dim behind it; captions wait
 * until it has left.
 */
const HookCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 120, mass: 0.7 },
  });
  const out = interpolate(frame, [HOOK_FRAMES - 12, HOOK_FRAMES], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const alpha = enter * (1 - out);

  return (
    <AbsoluteFill style={{ zIndex: 65 }}>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(8,8,10,0.62) 0%, rgba(8,8,10,0.44) 45%, rgba(8,8,10,0.68) 100%)",
          opacity: 1 - out,
        }}
      />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          paddingLeft: 78,
          paddingRight: 78,
          transform: `translateY(${(1 - enter) * 26 - out * 20}px) scale(${
            0.94 + enter * 0.06 + out * 0.03
          })`,
          opacity: alpha,
        }}
      >
        <div
          style={{
            fontFamily: SANS,
            fontWeight: 700,
            fontSize: 124,
            lineHeight: 1,
            letterSpacing: -4,
            color: theme.paper,
            textAlign: "center",
            textShadow: "0 4px 18px rgba(0,0,0,0.5)",
          }}
        >
          {hook.big}
        </div>
        <div
          style={{
            marginTop: 20,
            width: 260,
            height: 8,
            borderRadius: 999,
            background: theme.warm,
            transform: `scaleX(${interpolate(frame, [8, 22], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })})`,
          }}
        />
        <div
          style={{
            marginTop: 26,
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: 50,
            lineHeight: 1.2,
            letterSpacing: -0.8,
            color: "rgba(255,255,255,0.92)",
            textAlign: "center",
            textShadow: "0 2px 12px rgba(0,0,0,0.45)",
          }}
        >
          {hook.small}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const PriceReel: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: theme.ink }}>
      <Stage />
      <Panel />

      <AbsoluteFill style={{ zIndex: 50 }}>
        <Vignette strength={0.34} />
        <Grain opacity={0.05} />
      </AbsoluteFill>

      <AbsoluteFill style={{ zIndex: 60 }}>
        <CaptionsMontserrat
          lines={lines}
          size={60}
          bottom={300}
          hideBefore={HOOK_FRAMES}
        />
      </AbsoluteFill>

      <Sequence durationInFrames={HOOK_FRAMES} layout="none">
        <HookCard />
      </Sequence>

      {/* ------------------------------------------------------------ audio */}
      <Audio src={staticFile("voice5.m4a")} volume={1} />

      {frameCues.map((cue, i) => (
        <Sequence key={`sfx-${i}`} from={Math.max(0, cue.from - 9)} layout="none">
          <Audio src={staticFile(sfxFile(cue.sfx))} volume={0.26} />
        </Sequence>
      ))}

      <Audio
        src={staticFile("music-suspense.m4a")}
        volume={(f) =>
          // the same bed as the last reel: it builds, so it is held well under
          // the voice and only allowed forward for the opening and the CTA
          ramp(f, [
            [0, 0.22],
            [26, 0.1],
            [ctaFrame - 24, 0.1],
            [ctaFrame + 14, 0.34],
            [totalFrames - 22, 0.32],
            [totalFrames, 0],
          ])
        }
      />

      {/* a clean first frame: no flash, just the picture settling in */}
      <AbsoluteFill
        style={{
          zIndex: 70,
          background: theme.ink,
          opacity: interpolate(frame, [0, 8], [1, 0], {
            extrapolateRight: "clamp",
          }),
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
