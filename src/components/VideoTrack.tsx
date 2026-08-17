import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import {
  BROLL_SOURCE_START,
  chapters,
  clips,
  ctaFrame,
  FPS,
  punchFrames,
  speechEndFrame,
} from "../timeline";
import { theme } from "../theme";

/** Alternating zoom levels give the jump cuts somewhere to land. */
const ZOOMS = [1.0, 1.07, 1.03, 1.09, 1.01, 1.05, 1.04, 1.08];

const lastAtOrBefore = (values: number[], frame: number) => {
  let found = values[0] ?? 0;
  for (const v of values) {
    if (v <= frame) found = v;
    else break;
  }
  return found;
};

const clipIndexAt = (frame: number) => {
  for (let i = clips.length - 1; i >= 0; i--) {
    if (frame >= clips[i].from) return i;
  }
  return 0;
};

/**
 * One transform for the whole footage layer: base zoom per clip, a spring
 * kick on every cut and phrase start, and a framed-down state while a
 * chapter card is on screen.
 */
export const useFraming = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const index = clipIndexAt(frame);
  const clip = clips[index];
  const inClip = frame - clip.from;
  const base = ZOOMS[index % ZOOMS.length];
  const drift = interpolate(
    inClip,
    [0, clip.durationInFrames],
    [0, 0.035],
    { extrapolateRight: "clamp" },
  );

  const punch = lastAtOrBefore(punchFrames, frame);
  const settle = spring({
    frame: frame - punch,
    fps,
    config: { damping: 14, stiffness: 190, mass: 0.55 },
  });
  const isCut = clips.some((c) => c.from === punch);
  const kick = (1 - settle) * (isCut ? 0.055 : 0.022);

  const chapter = chapters.find(
    (c) => frame >= c.frame - 6 && frame < c.frame + 44,
  );
  const framedIn = chapter
    ? spring({
        frame: frame - (chapter.frame - 6),
        fps,
        config: { damping: 18, stiffness: 120 },
      })
    : 0;
  const framedOut = chapter
    ? spring({
        frame: frame - (chapter.frame + 30),
        fps,
        config: { damping: 18, stiffness: 120 },
      })
    : 0;
  const framed = Math.max(0, framedIn - framedOut);

  const scale = (base + drift + kick) * (1 - 0.18 * framed);
  const radius = 60 * framed;
  const shiftY = -90 * framed;

  return { scale, radius, shiftY, framed, index, inClip, settle, isCut };
};

export const VideoTrack: React.FC = () => {
  const frame = useCurrentFrame();
  const { scale, radius, shiftY, framed } = useFraming();
  const talk = staticFile("talk.mp4");

  const brollFrom = ctaFrame;
  const brollTrim = Math.round(BROLL_SOURCE_START * FPS);

  return (
    <AbsoluteFill
      style={{
        transform: `translateY(${shiftY}px) scale(${scale})`,
        borderRadius: radius,
        overflow: "hidden",
        boxShadow: framed > 0.05 ? `0 40px 120px rgba(0,0,0,0.7)` : undefined,
        outline: framed > 0.05 ? `3px solid rgba(255,197,61,${0.5 * framed})` : undefined,
      }}
    >
      {clips.map((clip, i) => {
        // the last stretch of talking head is replaced by the barbershop b-roll
        const end = clip.from + clip.durationInFrames;
        if (clip.from >= ctaFrame) return null;
        const duration = Math.min(end, ctaFrame) - clip.from;
        return (
          <Sequence
            key={i}
            from={clip.from}
            durationInFrames={duration}
            layout="none"
          >
            <OffthreadVideo
              src={talk}
              trimBefore={Math.round(clip.srcFrom * FPS)}
              muted
              toneMapped={false}
              style={{
                width: theme.width,
                height: theme.height,
                objectFit: "cover",
              }}
            />
          </Sequence>
        );
      })}

      <Sequence from={brollFrom} layout="none">
        <BRoll trim={brollTrim} />
      </Sequence>

      {/* deepen the grade a touch on the b-roll tail so the CTA text pops */}
      <AbsoluteFill
        style={{
          background: "#000",
          opacity: interpolate(
            frame,
            [speechEndFrame - 20, speechEndFrame + 24],
            [0, 0.34],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.ease) },
          ),
        }}
      />
    </AbsoluteFill>
  );
};

const BRoll: React.FC<{ trim: number }> = ({ trim }) => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, 260], [1.02, 1.12], {
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
      <OffthreadVideo
        src={staticFile("barber.mp4")}
        trimBefore={trim}
        muted
        toneMapped={false}
        style={{ width: theme.width, height: theme.height, objectFit: "cover" }}
      />
    </AbsoluteFill>
  );
};
