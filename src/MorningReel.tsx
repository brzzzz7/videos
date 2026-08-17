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
import { CaptionsApple } from "./components/CaptionsApple";
import { Grain, Vignette } from "./components/Grain";
import { UI } from "./fonts";
import { endCard, hook } from "./data/morning";
import {
  FPS,
  endCardFrame,
  hookFrames,
  labels,
  lines,
  shots,
  totalFrames,
} from "./morning";
import { theme } from "./theme";

/** Shots dissolve into each other: each one fades in over the previous. */
const ShotTrack: React.FC = () => (
  <AbsoluteFill>
    {shots.map((shot, i) => (
      <Sequence
        key={shot.id}
        from={shot.from - shot.fadeIn}
        durationInFrames={
          shot.fadeIn +
          shot.frames +
          shot.tailFrames +
          (shots[i + 1]?.fadeIn ?? 0)
        }
        layout="none"
      >
        <ShotLayer shot={shot} zIndex={i} />
      </Sequence>
    ))}
  </AbsoluteFill>
);

const ShotLayer: React.FC<{
  shot: (typeof shots)[number];
  zIndex: number;
}> = ({ shot, zIndex }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = shot.fadeIn
    ? interpolate(frame, [0, shot.fadeIn], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;

  // slow push-in for life, plus a soft settle when a section opens
  const drift = interpolate(frame, [0, shot.frames + shot.fadeIn], [0, 0.03], {
    extrapolateRight: "clamp",
  });
  const settle = shot.section
    ? spring({
        frame: frame - shot.fadeIn,
        fps,
        config: { damping: 22, stiffness: 90 },
      })
    : 1;
  const scale = 1.005 + drift + (1 - settle) * 0.02;

  return (
    <AbsoluteFill style={{ opacity, zIndex }}>
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        <OffthreadVideo
          src={staticFile(shot.file)}
          trimBefore={Math.max(0, shot.head - shot.fadeIn)}
          muted
          toneMapped={false}
          style={{
            width: theme.width,
            height: theme.height,
            objectFit: "cover",
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Opening title, over the first shot. */
const HookTitle: React.FC<{ frames: number }> = ({ frames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 110, mass: 0.7 },
  });
  const out = interpolate(frame, [frames - 12, frames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const alpha = enter * (1 - out);

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(8,8,10,0.55) 0%, rgba(8,8,10,0.25) 55%, rgba(8,8,10,0.6) 100%)",
          opacity: 1 - out,
        }}
      />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          paddingLeft: 90,
          paddingRight: 90,
          transform: `translateY(${(1 - enter) * 26 - out * 18}px) scale(${
            0.96 + enter * 0.04
          })`,
          opacity: alpha,
        }}
      >
        <div
          style={{
            fontFamily: UI,
            fontWeight: 700,
            fontSize: 148,
            letterSpacing: -4,
            color: theme.paper,
            textShadow: "0 6px 30px rgba(0,0,0,0.55)",
            lineHeight: 1,
          }}
        >
          {hook.big}
        </div>
        <div
          style={{
            marginTop: 22,
            fontFamily: UI,
            fontWeight: 600,
            fontSize: 54,
            letterSpacing: -1,
            color: "rgba(255,255,255,0.9)",
            textAlign: "center",
            textShadow: "0 2px 14px rgba(0,0,0,0.5)",
          }}
        >
          {hook.small}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** "Erreur 01" tag at the top, on each new section. */
const SectionLabels: React.FC = () => (
  <>
    {labels.map(({ label, frame }) => (
      <Sequence key={label} from={frame} durationInFrames={62} layout="none">
        <SectionLabel label={label} />
      </Sequence>
    ))}
  </>
);

const SectionLabel: React.FC<{ label: string }> = ({ label }) => {
  const frame = useCurrentFrame();
  const alpha =
    interpolate(frame, [0, 7], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }) *
    interpolate(frame, [50, 62], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: theme.safe.top }}>
      <div style={{ opacity: alpha, textAlign: "center" }}>
        <div
          style={{
            width: 54,
            height: 3,
            borderRadius: 999,
            background: theme.warm,
            margin: "0 auto 18px",
          }}
        />
        <div
          style={{
            fontFamily: UI,
            fontWeight: 600,
            fontSize: 34,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.92)",
            textShadow: "0 2px 10px rgba(0,0,0,0.5)",
          }}
        >
          {label}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Clean end card once the voice-over is done. */
const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 110, mass: 0.7 },
  });

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background: "rgba(8,8,10,0.42)",
          opacity: interpolate(frame, [0, 10], [0, 1], {
            extrapolateRight: "clamp",
          }),
        }}
      />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          transform: `translateY(${(1 - enter) * 22}px)`,
          opacity: enter,
        }}
      >
        <div
          style={{
            fontFamily: UI,
            fontWeight: 700,
            fontSize: 96,
            letterSpacing: -2.5,
            color: theme.paper,
            textShadow: "0 4px 24px rgba(0,0,0,0.55)",
          }}
        >
          {endCard.big}
        </div>
        <div
          style={{
            marginTop: 18,
            fontFamily: UI,
            fontWeight: 600,
            fontSize: 44,
            letterSpacing: -0.5,
            color: theme.warm,
            textShadow: "0 2px 14px rgba(0,0,0,0.5)",
          }}
        >
          {endCard.small}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const MorningReel: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: theme.ink }}>
      <ShotTrack />
      <AbsoluteFill style={{ zIndex: 99 }}>
        <Vignette strength={0.42} />
      </AbsoluteFill>

      {/* the shot track stacks itself with z-index, so the overlays claim
          higher layers explicitly */}
      <AbsoluteFill style={{ zIndex: 100 }}>
        <Sequence durationInFrames={hookFrames} layout="none">
          <HookTitle frames={hookFrames} />
        </Sequence>

        <SectionLabels />

        <CaptionsApple lines={lines} hideBefore={hookFrames} size={66} />

        <Sequence from={endCardFrame} layout="none">
          <EndCard />
        </Sequence>

        <Grain opacity={0.06} />
      </AbsoluteFill>

      {/* ------------------------------------------------------------ audio */}
      {shots.map((shot) => (
        <Sequence
          key={`v-${shot.id}`}
          from={shot.from}
          durationInFrames={shot.frames}
          layout="none"
        >
          <Audio
            src={staticFile("morning-voice.m4a")}
            trimBefore={Math.round(shot.srcStart * FPS)}
            volume={(f) =>
              // tiny ramps so a cut on a breath never clicks
              Math.min(
                interpolate(f, [0, 2], [0, 1], { extrapolateRight: "clamp" }),
                interpolate(f, [shot.frames - 2, shot.frames], [1, 0], {
                  extrapolateLeft: "clamp",
                }),
              )
            }
          />
        </Sequence>
      ))}

      {shots
        .filter((s) => s.section && s.from > 0)
        .map((shot) => (
          <Sequence
            key={`sfx-${shot.id}`}
            from={Math.max(0, shot.from - shot.fadeIn - 3)}
            layout="none"
          >
            <Audio src={staticFile("whoosh.m4a")} volume={0.16} />
          </Sequence>
        ))}

      <Audio
        src={staticFile("morning-music.m4a")}
        volume={(f) =>
          interpolate(
            f,
            [0, hookFrames - 8, hookFrames + 10, endCardFrame - 20, endCardFrame + 12, totalFrames - 18, totalFrames],
            [0.3, 0.28, 0.16, 0.18, 0.42, 0.4, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          )
        }
      />
    </AbsoluteFill>
  );
};
