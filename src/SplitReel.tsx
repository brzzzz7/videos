import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";

import "./fonts";
import { CaptionsMontserrat } from "./components/CaptionsMontserrat";
import { Grain, Vignette } from "./components/Grain";
import {
  Counter,
  CtaIllo,
  Doses,
  Gauge,
  MatteWax,
  Products,
  Strand,
  Timeline,
} from "./components/illos";
import { ramp } from "./lib/audio";
import type { Illo } from "./data/split";
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
} from "./split";
import { theme } from "./theme";

const Illustration: React.FC<{ illo: Illo }> = ({ illo }) => {
  switch (illo.kind) {
    case "counter":
      return <Counter />;
    case "gauge":
      return (
        <Gauge
          from={illo.from}
          to={illo.to}
          caption={illo.caption}
          title={illo.title}
          danger={illo.danger}
        />
      );
    case "strand":
      return <Strand />;
    case "timeline":
      return <Timeline good={illo.good} />;
    case "products":
      return <Products />;
    case "matte":
      return <MatteWax />;
    case "doses":
      return <Doses />;
    case "cta":
      return <CtaIllo />;
  }
};

/**
 * The picture keeps the bottom half when the screen splits. The window slides
 * down to BOTTOM_WINDOW_TOP so his face stays framed in that half instead of
 * being cropped at the chin.
 */
const Stage: React.FC = () => {
  const frame = useCurrentFrame();
  const open = splitAt(frame);
  const clipTop = SPLIT_LINE * open;
  const videoTop = BOTTOM_WINDOW_TOP * open;

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
        src={staticFile("talk3.mp4")}
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
      {/* every cue owns its own sequence, so back-to-back cues dissolve into
          each other instead of swapping on a single frame */}
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
    interpolate(frame, [0, 5], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }) *
    interpolate(frame, [length - 5, length], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  return <AbsoluteFill style={{ opacity: alpha }}>{children}</AbsoluteFill>;
};

export const SplitReel: React.FC = () => {
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
        <CaptionsMontserrat lines={lines} size={62} bottom={340} />
      </AbsoluteFill>

      {/* ------------------------------------------------------------ audio */}
      <Audio src={staticFile("voice3.m4a")} volume={1} />

      {frameCues.map((cue, i) => (
        <Sequence key={`sfx-${i}`} from={Math.max(0, cue.from - 9)} layout="none">
          <Audio src={staticFile(sfxFile(cue.sfx))} volume={0.3} />
        </Sequence>
      ))}

      <Audio
        src={staticFile("music-light.m4a")}
        volume={(f) =>
          // light and professional means staying out of the way: the bed only
          // steps forward for the opening and the closing card
          ramp(f, [
            [0, 0.2],
            [24, 0.09],
            [ctaFrame - 24, 0.1],
            [ctaFrame + 14, 0.24],
            [totalFrames - 26, 0.22],
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
