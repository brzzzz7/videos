import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";

import "./fonts";
import { Backdrop } from "./components/Backdrop";
import { ChapterCards } from "./components/ChapterCard";
import { Cta } from "./components/Cta";
import { Grain, Vignette } from "./components/Grain";
import { Hook, HOOK_FRAMES } from "./components/Hook";
import { Hud } from "./components/Hud";
import { Subtitles } from "./components/Subtitles";
import { VideoTrack } from "./components/VideoTrack";
import {
  BROLL_SOURCE_START,
  chapters,
  clips,
  ctaFrame,
  FPS,
  speechEndFrame,
  totalFrames,
} from "./timeline";
import { theme } from "./theme";

/** 2-frame white blink on the harder cuts — reads as impact, not as an error. */
const CutFlashes: React.FC = () => (
  <>
    {clips.slice(1).map((clip, i) =>
      i % 2 === 0 ? (
        <Sequence key={clip.from} from={clip.from} durationInFrames={2} layout="none">
          <AbsoluteFill style={{ background: theme.paper, opacity: 0.16 }} />
        </Sequence>
      ) : null,
    )}
  </>
);

export const Reel: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: theme.ink }}>
      <Backdrop />
      <VideoTrack />
      <Vignette />
      <CutFlashes />

      <Sequence durationInFrames={HOOK_FRAMES} layout="none">
        <Hook />
      </Sequence>

      <ChapterCards />
      <Hud />

      <Subtitles hideBefore={HOOK_FRAMES - 6} />

      <Sequence from={speechEndFrame - 6} layout="none">
        <Cta />
      </Sequence>

      <Grain />

      {/* ---------------------------------------------------------- audio */}
      {clips.map((clip, i) => (
        <Sequence
          key={`voice-${i}`}
          from={clip.from}
          durationInFrames={clip.durationInFrames}
          layout="none"
        >
          <Audio
            src={staticFile("voice.m4a")}
            trimBefore={Math.round(clip.srcFrom * FPS)}
            volume={1}
          />
        </Sequence>
      ))}

      <Sequence from={ctaFrame} layout="none">
        <Audio
          src={staticFile("room.m4a")}
          trimBefore={Math.round(BROLL_SOURCE_START * FPS)}
          volume={(f) =>
            interpolate(f, [0, 12], [0, 0.26], { extrapolateRight: "clamp" })
          }
        />
      </Sequence>

      {/* transition sound design: a sweep into each card, a thump on the slam */}
      {chapters.map((chapter) => (
        <React.Fragment key={`sfx-${chapter.index}`}>
          <Sequence from={Math.max(0, chapter.frame - 10)} layout="none">
            <Audio src={staticFile("whoosh.m4a")} volume={0.34} />
          </Sequence>
          <Sequence from={chapter.frame - 4} layout="none">
            <Audio src={staticFile("impact.m4a")} volume={0.3} />
          </Sequence>
        </React.Fragment>
      ))}

      <Sequence from={HOOK_FRAMES - 8} layout="none">
        <Audio src={staticFile("whoosh.m4a")} volume={0.4} />
      </Sequence>

      <Sequence from={ctaFrame - 6} layout="none">
        <Audio src={staticFile("impact.m4a")} volume={0.36} />
      </Sequence>

      <Audio
        src={staticFile("music.m4a")}
        volume={(f) =>
          interpolate(
            f,
            [
              0,
              HOOK_FRAMES - 10,
              HOOK_FRAMES + 6,
              speechEndFrame - 30,
              speechEndFrame + 10,
              totalFrames - 22,
              totalFrames,
            ],
            [0.26, 0.24, 0.12, 0.16, 0.5, 0.46, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          )
        }
      />

      {/* a hair of shake on the very first frames, so the hook lands hard */}
      <AbsoluteFill
        style={{
          background: theme.paper,
          opacity: interpolate(frame, [0, 3], [0.55, 0], {
            extrapolateRight: "clamp",
          }),
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
