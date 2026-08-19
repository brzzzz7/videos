import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import "./fonts";
import { CaptionsMontserrat } from "./components/CaptionsMontserrat";
import { Grain, Vignette } from "./components/Grain";
import {
  CtaScene,
  FinasterideScene,
  GraftScene,
  IntroScene,
  MarketingScene,
  MedicalScene,
  MinoxidilScene,
} from "./components/illos/solutions";
import { SANS } from "./fonts";
import { ramp } from "./lib/audio";
import { cta, hook, type Scene } from "./data/solutions";
import {
  clips,
  ctaFrame,
  cueSounds,
  FPS,
  frameScenes,
  lines,
  sfxFile,
  totalFrames,
} from "./solutions";
import { theme } from "./theme";

export const HOOK_FRAMES = 66; // 2.2 s

const SceneBody: React.FC<{ scene: Scene }> = ({ scene }) => {
  switch (scene.kind) {
    case "intro":
      return <IntroScene />;
    case "marketing":
      return <MarketingScene />;
    case "minoxidil":
      return <MinoxidilScene />;
    case "finasteride":
      return <FinasterideScene />;
    case "graft":
      return <GraftScene />;
    case "medical":
      return <MedicalScene />;
    case "cta":
      return <CtaScene title={cta.title} line={cta.line} chip={cta.chip} />;
  }
};

/** Scenes cross-dissolve: there is no footage underneath to cut against. */
const SceneTrack: React.FC = () => (
  <AbsoluteFill>
    {frameScenes.map((scene, i) => (
      <Sequence
        key={i}
        from={Math.max(0, scene.from - 6)}
        durationInFrames={scene.durationInFrames + (i === 0 ? 6 : 12)}
        layout="none"
      >
        <SceneFade first={i === 0}>
          <SceneBody scene={scene.scene} />
        </SceneFade>
      </Sequence>
    ))}
  </AbsoluteFill>
);

const SceneFade: React.FC<{
  first: boolean;
  children: React.ReactNode;
}> = ({ first, children }) => {
  const frame = useCurrentFrame();
  const alpha = first
    ? 1
    : interpolate(frame, [0, 8], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
  return <AbsoluteFill style={{ opacity: alpha }}>{children}</AbsoluteFill>;
};

/** Opening promise over the first two seconds. */
const HookCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 20, stiffness: 120, mass: 0.7 } });
  const out = interpolate(frame, [HOOK_FRAMES - 12, HOOK_FRAMES], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ zIndex: 65 }}>
      <AbsoluteFill style={{ background: "rgba(9,9,12,0.62)", opacity: 1 - out }} />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          paddingLeft: 84,
          paddingRight: 84,
          transform: `translateY(${(1 - enter) * 26 - out * 20}px) scale(${
            0.94 + enter * 0.06 + out * 0.03
          })`,
          opacity: enter * (1 - out),
        }}
      >
        <div
          style={{
            fontFamily: SANS,
            fontWeight: 700,
            fontSize: 132,
            lineHeight: 1,
            letterSpacing: -4,
            color: theme.paper,
            textShadow: "0 4px 18px rgba(0,0,0,0.5)",
          }}
        >
          {hook.big}
        </div>
        <div
          style={{
            marginTop: 20,
            width: 280,
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
            fontSize: 46,
            lineHeight: 1.25,
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

export const SolutionsReel: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: theme.ink }}>
      <SceneTrack />

      <AbsoluteFill style={{ zIndex: 50 }}>
        <Vignette strength={0.3} />
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
      {clips.map((clip, i) => (
        <Sequence
          key={`voice-${i}`}
          from={clip.from}
          durationInFrames={clip.durationInFrames}
          layout="none"
        >
          <Audio
            src={staticFile("voice4.m4a")}
            trimBefore={Math.round(clip.srcFrom * FPS)}
            volume={(f) =>
              Math.min(
                interpolate(f, [0, 2], [0, 1], { extrapolateRight: "clamp" }),
                interpolate(
                  f,
                  [clip.durationInFrames - 2, clip.durationInFrames],
                  [1, 0],
                  { extrapolateLeft: "clamp" },
                ),
              )
            }
          />
        </Sequence>
      ))}

      {cueSounds.map((cue, i) => (
        <Sequence key={`sfx-${i}`} from={Math.max(0, cue.frame - 4)} layout="none">
          <Audio src={staticFile(sfxFile(cue.sfx))} volume={0.28} />
        </Sequence>
      ))}

      <Audio
        src={staticFile("music-light.m4a")}
        volume={(f) =>
          ramp(f, [
            [0, 0.2],
            [26, 0.085],
            [ctaFrame - 24, 0.1],
            [ctaFrame + 14, 0.26],
            [totalFrames - 24, 0.24],
            [totalFrames, 0],
          ])
        }
      />

      <AbsoluteFill
        style={{
          zIndex: 70,
          background: theme.ink,
          opacity: interpolate(frame, [0, 8], [1, 0], { extrapolateRight: "clamp" }),
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
