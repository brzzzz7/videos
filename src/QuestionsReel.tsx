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
  Ask,
  CtaQuestions,
  Genetics,
  Scalp,
  Unique,
} from "./components/illos/questions";
import { ramp } from "./lib/audio";
import type { Scene } from "./data/questions";
import { hook } from "./data/questions";
import {
  clips,
  ctaFrame,
  cueMark,
  cueWindow,
  cutFrames,
  FPS,
  frameCues,
  lines,
  SCENE_FRAMES,
  sfxFile,
  totalFrames,
} from "./questions";
import { theme } from "./theme";

/** `at` turns a scene's beats, written in source seconds, into local frames. */
const Illustration: React.FC<{ scene: Scene; at: (s: number) => number }> = ({
  scene,
  at,
}) => {
  switch (scene.kind) {
    case "ask":
      return <Ask index={scene.index} question={scene.question} />;
    case "genetics":
      return <Genetics at={at} />;
    case "scalp":
      return <Scalp at={at} />;
    case "unique":
      return <Unique at={at} />;
    case "cta":
      return <CtaQuestions at={at} />;
  }
};

/** The last jump cut at or before this frame — what the kick springs from. */
const lastCutAtOrBefore = (frame: number) => {
  let found = 0;
  for (const cut of cutFrames) {
    if (cut <= frame) found = cut;
    else break;
  }
  return found;
};

/**
 * The facecam. The pauses are cut, so the footage is a run of clips; the camera
 * never moves in this take, so each cut gets a small spring kick to keep a hard
 * cut on a static frame from reading as a glitch.
 */
const Facecam: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const settle = spring({
    frame: frame - lastCutAtOrBefore(frame),
    fps,
    config: { damping: 16, stiffness: 170, mass: 0.6 },
  });
  const kick = frame < cutFrames[0] ? 1 : 0.974 + settle * 0.026;

  return (
    <AbsoluteFill style={{ transform: `scale(${kick})`, transformOrigin: "50% 42%" }}>
      {clips.map((clip, i) => (
        <Sequence
          key={`clip-${i}`}
          from={clip.from}
          durationInFrames={clip.durationInFrames}
          layout="none"
        >
          <OffthreadVideo
            src={staticFile("talk7.mp4")}
            trimBefore={Math.round(clip.srcFrom * FPS)}
            muted
            toneMapped={false}
            style={{
              position: "absolute",
              inset: 0,
              width: theme.width,
              height: theme.height,
              objectFit: "cover",
            }}
          />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

/**
 * A scene, wiping over the whole frame.
 *
 * It scales in from just under full size rather than cross-fading: a dissolve
 * between a lit face and a dark graphic goes muddy in the middle, where both
 * are half-present.
 */
const SceneWipe: React.FC<{ length: number; children: React.ReactNode }> = ({
  length,
  children,
}) => {
  const frame = useCurrentFrame();
  const inp = interpolate(frame, [0, SCENE_FRAMES], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const out = interpolate(frame, [length - SCENE_FRAMES, length], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const p = Math.min(inp, out);

  return (
    <AbsoluteFill
      style={{
        opacity: Math.min(1, p * 1.8),
        transform: `scale(${0.985 + p * 0.015})`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export const HOOK_FRAMES = 63;   // 2.1 s

/**
 * The opening promise, in a framed box on the upper part of the screen — the
 * dim is a gradient over the top third only, so the facecam stays readable
 * underneath instead of sitting behind a full-frame scrim.
 */
const HookCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 130, mass: 0.7 },
  });
  const out = interpolate(frame, [HOOK_FRAMES - 12, HOOK_FRAMES], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const alpha = enter * (1 - out);

  return (
    <AbsoluteFill style={{ zIndex: 65 }}>
      {/* only the top of the frame is dimmed, just enough to seat the box */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(8,8,10,0.72) 0%, rgba(8,8,10,0.5) 46%, rgba(8,8,10,0) 72%)",
          opacity: 1 - out,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 190,
          left: 70,
          right: 70,
          padding: "46px 44px 48px",
          borderRadius: 36,
          border: `4px solid ${theme.warm}`,
          background: "rgba(10,10,13,0.62)",
          boxShadow: "0 30px 90px rgba(0,0,0,0.6)",
          textAlign: "center",
          transform: `translateY(${(1 - enter) * -34 - out * 18}px) scale(${
            0.93 + enter * 0.07
          })`,
          opacity: alpha,
        }}
      >
        <div
          style={{
            fontFamily: SANS,
            fontWeight: 700,
            fontSize: 108,
            lineHeight: 1.02,
            letterSpacing: -3.5,
            color: theme.paper,
            textShadow: "0 4px 18px rgba(0,0,0,0.55)",
          }}
        >
          {hook.big}
        </div>
        <div
          style={{
            margin: "22px auto 0",
            width: 220,
            height: 7,
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
            marginTop: 22,
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: 42,
            lineHeight: 1.22,
            letterSpacing: -0.6,
            color: "rgba(255,255,255,0.92)",
            textShadow: "0 2px 12px rgba(0,0,0,0.5)",
          }}
        >
          {hook.small}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const QuestionsReel: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: theme.ink }}>
      <Facecam />

      {/* the scenes take the whole frame, over the facecam */}
      {frameCues.map((cue, i) => (
        <Sequence key={`scene-${i}`} {...cueWindow(cue)} layout="none">
          <SceneWipe length={cueWindow(cue).durationInFrames}>
            <Illustration scene={cue.scene} at={cueMark(cue)} />
          </SceneWipe>
        </Sequence>
      ))}

      <AbsoluteFill style={{ zIndex: 50 }}>
        <Vignette strength={0.32} />
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
      {/* the voice is cut on the same spans as the picture, so a trimmed pause
          removes image and sound together */}
      {clips.map((clip, i) => (
        <Sequence
          key={`voice-${i}`}
          from={clip.from}
          durationInFrames={clip.durationInFrames}
          layout="none"
        >
          <Audio
            src={staticFile("voice7.m4a")}
            trimBefore={Math.round(clip.srcFrom * FPS)}
            volume={1}
          />
        </Sequence>
      ))}

      {frameCues.map((cue, i) => (
        <Sequence
          key={`sfx-${i}`}
          from={Math.max(0, cue.from - SCENE_FRAMES)}
          layout="none"
        >
          <Audio src={staticFile(sfxFile(cue.sfx))} volume={0.26} />
        </Sequence>
      ))}

      <Audio
        src={staticFile("music-suspense.m4a")}
        volume={(f) =>
          // same bed as the last reel: held well under the voice, forward only
          // for the opening and the CTA
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
