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
import { DISPLAY } from "./fonts";
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
  RATE,
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
    config: { damping: 15, stiffness: 190, mass: 0.55 },
  });
  const kick = frame < cutFrames[0] ? 1 : 0.964 + settle * 0.036;

  // Which clip we are inside, so the push can restart with each one.
  let index = 0;
  for (let i = clips.length - 1; i >= 0; i--) {
    if (frame >= clips[i].from) {
      index = i;
      break;
    }
  }
  const clip = clips[index];
  // A slow push, alternating in and out so two clips in a row never drift the
  // same way — the camera never moves in this take, and a static frame under a
  // fast cut reads as a freeze.
  const dir = index % 2 === 0 ? 1 : -1;
  const push = interpolate(
    frame - clip.from,
    [0, clip.durationInFrames],
    dir > 0 ? [1.0, 1.05] : [1.05, 1.0],
    { extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{ transform: `scale(${kick * push})`, transformOrigin: "50% 42%" }}
    >
      {clips.map((c, i) => (
        <Sequence
          key={`clip-${i}`}
          from={c.from}
          durationInFrames={c.durationInFrames}
          layout="none"
        >
          <OffthreadVideo
            src={staticFile("talk7.mp4")}
            trimBefore={Math.round(c.srcFrom * FPS)}
            playbackRate={RATE}
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

export const HOOK_FRAMES = 96;   // 3.2 s — it now overlaps the first question

/**
 * Captions come back before the hook leaves. The first phrase is the hook said
 * out loud, so nothing is lost by covering it, and the question underneath gets
 * its own caption from the moment it appears.
 */
export const CAPTIONS_FROM = 57;

/**
 * The opening hook, over the top of the frame.
 *
 * No card and no border: it sits straight on the picture, held up by a warm
 * glow, a heavy face and a marker swipe rather than by a box. Anton is used
 * here and nowhere else in the reel — a condensed display face next to the
 * Montserrat captions reads as a different voice, which is the point of a hook.
 */
const HookCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pop = (delay: number) =>
    spring({
      frame: frame - delay,
      fps,
      config: { damping: 13, stiffness: 200, mass: 0.6 },
    });

  const eyebrow = pop(2);
  const first = pop(7);
  const second = pop(14);
  // the swipe runs through "me demander" once the line has landed
  const swipe = interpolate(frame, [22, 34], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const out = interpolate(frame, [HOOK_FRAMES - 12, HOOK_FRAMES], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // never entirely still, so it holds the eye for its three seconds
  const float = Math.sin(frame / 22) * 5;

  const display = {
    fontFamily: DISPLAY,
    fontWeight: 400,
    textTransform: "uppercase",
    lineHeight: 0.94,
    letterSpacing: -1,
  } as const;

  return (
    <AbsoluteFill style={{ zIndex: 65, opacity: 1 - out }}>
      {/* the only backing is light: a warm bloom and a dip at the very top */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(80% 30% at 50% 25%, rgba(255,201,138,0.26) 0%, rgba(255,201,138,0) 70%), linear-gradient(180deg, rgba(8,8,10,0.7) 0%, rgba(8,8,10,0.44) 22%, rgba(8,8,10,0) 36%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          // Seated between the scene's index chip (which sits at 240) and the
          // band the scenes draw in (from 640): the hook outlives the first
          // question card now, so the two have to share the top of the frame
          // rather than land on each other.
          top: 320,
          left: 62,
          right: 62,
          textAlign: "center",
          transform: `translateY(${float - out * 26}px)`,
        }}
      >
        <div
          style={{
            ...display,
            fontSize: 46,
            letterSpacing: 10,
            color: theme.warm,
            opacity: eyebrow,
            transform: `translateY(${(1 - eyebrow) * -18}px)`,
            textShadow: "0 2px 18px rgba(0,0,0,0.6)",
          }}
        >
          {hook.eyebrow}
        </div>

        <div
          style={{
            ...display,
            marginTop: 18,
            fontSize: 104,
            color: theme.paper,
            opacity: first,
            transform: `translateY(${(1 - first) * 26}px) scale(${
              0.88 + first * 0.12
            })`,
            textShadow:
              "0 6px 30px rgba(0,0,0,0.75), 0 2px 6px rgba(0,0,0,0.6)",
          }}
        >
          {hook.line1}
        </div>

        {/* the swipe: a warm bar wipes across and the text flips to ink on it */}
        <div
          style={{
            position: "relative",
            display: "inline-block",
            marginTop: 10,
            padding: "6px 18px",
            opacity: second,
            transform: `translateY(${(1 - second) * 26}px) scale(${
              0.88 + second * 0.12
            })`,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 14,
              background: `linear-gradient(90deg, ${theme.goldDeep}, ${theme.warm})`,
              transform: `scaleX(${swipe})`,
              transformOrigin: "0% 50%",
              boxShadow: "0 10px 40px rgba(255,201,138,0.35)",
            }}
          />
          <div
            style={{
              ...display,
              position: "relative",
              fontSize: 136,
              color: theme.paper,
              textShadow:
                "0 6px 30px rgba(0,0,0,0.75), 0 2px 6px rgba(0,0,0,0.6)",
            }}
          >
            {hook.line2}
          </div>
          {/* the same words in ink, revealed exactly as far as the bar has run */}
          <div
            style={{
              ...display,
              position: "absolute",
              top: 6,
              left: 18,
              right: 18,
              fontSize: 136,
              color: "#171310",
              clipPath: `inset(0 ${(1 - swipe) * 100}% 0 0)`,
            }}
          >
            {hook.line2}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const QuestionsReel: React.FC = () => {
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
          hideBefore={CAPTIONS_FROM}
        />
      </AbsoluteFill>

      <Sequence durationInFrames={HOOK_FRAMES} layout="none">
        <HookCard />
      </Sequence>

      {/* ------------------------------------------------------------ audio */}
      {/* The voice is cut on the same spans as the picture. Its file already
          carries the speed-up (build-voice.py's VOICE_TEMPO), so it is trimmed
          in its own sped timebase — srcFrom / RATE — and gets no playbackRate;
          the video is the one Remotion retimes. */}
      {clips.map((clip, i) => (
        <Sequence
          key={`voice-${i}`}
          from={clip.from}
          durationInFrames={clip.durationInFrames}
          layout="none"
        >
          <Audio
            src={staticFile("voice7.m4a")}
            trimBefore={Math.round((clip.srcFrom / RATE) * FPS)}
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

    </AbsoluteFill>
  );
};
