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
  Adapt,
  Broll,
  CtaStyle,
  Morpho,
  Styling,
} from "./components/illos/style";
import { ramp } from "./lib/audio";
import type { Scene } from "./data/style";
import { hook } from "./data/style";
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
} from "./style";
import { theme } from "./theme";

/** `at` turns a scene's beats, written in source seconds, into local frames. */
const Illustration: React.FC<{ scene: Scene; at: (s: number) => number }> = ({
  scene,
  at,
}) => {
  switch (scene.kind) {
    case "broll":
      return <Broll />;
    case "styling":
      return <Styling />;
    case "morpho":
      return <Morpho at={at} />;
    case "adapt":
      return <Adapt />;
    case "cta":
      return <CtaStyle at={at} />;
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
            src={staticFile("talk8.mp4")}
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

export const HOOK_FRAMES = 100;   // 3.3 s — it overlaps the inserted clip

/**
 * Captions come back where phrase 0 ends, not where the hook leaves: the hook
 * is that phrase, so it is the caption for it.
 */
export const CAPTIONS_FROM = 88;

/**
 * The opening hook: his own first sentence, over the top of the frame.
 *
 * Each part springs in as he says it, so the hook reads as the line being
 * spoken rather than as a title card laid over it. Phrase 0 runs to frame 87,
 * which is where the captions take over.
 *
 * No card and no border: it is held up by a warm glow, a heavy face and a marker
 * swipe. Anton is used here and nowhere else in the reel — a condensed display
 * face next to the Montserrat captions reads as a different voice, which is the
 * point of a hook.
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

  // Where each part of the sentence falls inside phrase 0. The numbers are its
  // own word timings, from the same syllable-weighted pass the captions use:
  // "cette coupe" 4-15, "est partout en ce moment" 15-40, the question to 87.
  const first = pop(4);
  const punch = pop(16);
  const rest = pop(41);
  // the marker sweeps across while he says "partout"
  const swipe = interpolate(frame, [19, 33], [0, 1], {
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

  const shadow =
    "0 6px 30px rgba(0,0,0,0.75), 0 2px 6px rgba(0,0,0,0.6)";

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
            fontSize: 54,
            letterSpacing: 4,
            color: theme.warm,
            opacity: first,
            transform: `translateY(${(1 - first) * -18}px)`,
            textShadow: "0 2px 18px rgba(0,0,0,0.6)",
          }}
        >
          {hook.first}
        </div>

        {/* the swipe: a warm bar wipes across and the text flips to ink on it */}
        <div
          style={{
            position: "relative",
            display: "inline-block",
            marginTop: 14,
            padding: "6px 18px",
            opacity: punch,
            transform: `translateY(${(1 - punch) * 26}px) scale(${
              0.88 + punch * 0.12
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
              fontSize: 92,
              color: theme.paper,
              textShadow: shadow,
            }}
          >
            {hook.punch}
          </div>
          {/* the same words in ink, revealed exactly as far as the bar has run */}
          <div
            style={{
              ...display,
              position: "absolute",
              top: 6,
              left: 18,
              right: 18,
              fontSize: 92,
              color: "#171310",
              clipPath: `inset(0 ${(1 - swipe) * 100}% 0 0)`,
            }}
          >
            {hook.punch}
          </div>
        </div>

        <div
          style={{
            ...display,
            marginTop: 14,
            fontSize: 54,
            color: "rgba(255,255,255,0.94)",
            opacity: rest,
            transform: `translateY(${(1 - rest) * 20}px)`,
            textShadow: shadow,
          }}
        >
          {hook.rest}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const StyleReel: React.FC = () => {
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
            src={staticFile("voice8.m4a")}
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
