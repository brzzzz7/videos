import React from "react";
import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
} from "remotion";

import { theme } from "../../theme";
import {
  fade,
  GREEN,
  RED,
  SceneFrame,
  Stage,
  text,
  useSpring,
  type Beat,
} from "./scene-kit";

/**
 * The clip he sent, full frame, on "cette coupe est partout".
 *
 * It arrived as a screen recording, so the app chrome — the search bar, the
 * engagement column, another creator's handle and the comment box — is cropped
 * out in `scripts/prepare-broll.sh` rather than shown. It is muted too: the
 * original carries someone else's voice and music, and his own has to stay
 * clean.
 */
export const Broll: React.FC = () => {
  const frame = useCurrentFrame();
  const grow = useSpring();
  const tag = grow(6);
  // a slow push so the insert has the same life as the rest of the reel
  const push = interpolate(frame, [0, 90], [1.04, 1.1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: theme.ink, overflow: "hidden" }}>
      <OffthreadVideo
        src={staticFile("cut-broll.mp4")}
        muted
        toneMapped={false}
        style={{
          position: "absolute",
          inset: 0,
          width: theme.width,
          height: theme.height,
          objectFit: "cover",
          transform: `scale(${push})`,
        }}
      />
      {/* says whose frame this is, so the cut away from him reads as a citation */}
      <div
        style={{
          position: "absolute",
          top: 240,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          opacity: tag,
          transform: `translateY(${(1 - tag) * -16}px)`,
        }}
      >
        <div
          style={{
            ...text(30, 700, "#171310"),
            background: theme.warm,
            padding: "10px 24px",
            borderRadius: 999,
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          la coupe en question
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** The upside: nothing to do with it in the morning. */
export const Styling: React.FC = () => {
  const frame = useCurrentFrame();
  const grow = useSpring();
  const p = grow(4);
  const strike = fade(frame, 14, 10);

  return (
    <SceneFrame index="son gros avantage" title="zéro coiffage">
      <Stage>
        <div style={{ position: "relative", opacity: p, transform: `scale(${0.88 + p * 0.12})` }}>
          <svg width="520" height="420" viewBox="0 0 260 210">
            {/* a comb: the thing you do not need */}
            <rect x="26" y="30" width="208" height="44" rx="14" fill={theme.paper} />
            {Array.from({ length: 13 }).map((_, i) => (
              <rect
                key={i}
                x={34 + i * 16}
                y="74"
                width="8"
                height="82"
                rx="4"
                fill={theme.paper}
              />
            ))}
            <line
              x1="24" y1="20" x2="238" y2="176"
              stroke={RED} strokeWidth="18" strokeLinecap="round"
              strokeDasharray="280" strokeDashoffset={280 * (1 - strike)}
            />
          </svg>
        </div>
      </Stage>
    </SceneFrame>
  );
};

/**
 * A head seen face-on, long or round depending on the ratio.
 *
 * The hair is the whole head in dark, with the face laid over it below a
 * straight fringe line — which is what this cut actually looks like: cropped
 * short with a blunt front. Drawing the hair as a thin cap on top read as a
 * headband at this size.
 */
const FaceShape: React.FC<{
  /** 1 = long and narrow, 0 = round */
  ratio: number;
  tint?: string;
  id: string;
}> = ({ ratio, tint = "#D8A87A", id }) => {
  const cx = 150;
  const cy = 168;
  const rx = 118 - ratio * 26;
  const ry = 118 + ratio * 46;
  const fringe = cy - ry * 0.44;

  return (
    <svg width="430" height="470" viewBox="0 0 300 340">
      <defs>
        <clipPath id={`face-${id}`}>
          <rect x="0" y={fringe} width="300" height="340" />
        </clipPath>
      </defs>
      <path
        d={`M${cx - rx * 1.32} 340 Q${cx - rx * 0.9} ${cy + ry * 0.92} ${cx} ${cy + ry * 0.88}
            Q${cx + rx * 0.9} ${cy + ry * 0.92} ${cx + rx * 1.32} 340 Z`}
        fill="rgba(255,255,255,0.14)"
      />
      {/* the cut: the whole skull in dark, cut off by a straight fringe */}
      <ellipse cx={cx} cy={cy} rx={rx + 6} ry={ry + 6} fill="#3A2718" />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={tint} clipPath={`url(#face-${id})`} />
      <rect
        x={cx - rx - 6}
        y={fringe - 4}
        width={(rx + 6) * 2}
        height="8"
        fill="#2A1B10"
        clipPath={`url(#face-${id})`}
        opacity="0.45"
      />
      <ellipse cx={cx - rx * 0.4} cy={cy - ry * 0.06} rx="9" ry="12" fill="#3A2718" opacity="0.85" />
      <ellipse cx={cx + rx * 0.4} cy={cy - ry * 0.06} rx="9" ry="12" fill="#3A2718" opacity="0.85" />
      <path
        d={`M${cx - rx * 0.3} ${cy + ry * 0.42} Q${cx} ${cy + ry * 0.52} ${cx + rx * 0.3} ${cy + ry * 0.42}`}
        fill="none" stroke="#3A2718" strokeWidth="7" strokeLinecap="round" opacity="0.7"
      />
    </svg>
  );
};

/** Who it suits: long and narrow yes, round no. */
export const Morpho: React.FC<Beat> = ({ at }) => {
  const frame = useCurrentFrame();
  const grow = useSpring();
  const long = grow(6);
  const round = grow(at(12.7));
  const verdict = fade(frame, at(14.4), 12);

  const Card: React.FC<{
    p: number;
    ratio: number;
    label: string;
    ok: boolean;
    /** must be id-safe: it ends up inside url(#...) */
    id: string;
  }> = ({ p, ratio, label, ok, id }) => (
    <div
      style={{
        textAlign: "center",
        opacity: p,
        transform: `translateY(${(1 - p) * 26}px) scale(${0.9 + p * 0.1})`,
      }}
    >
      <div style={{ position: "relative" }}>
        <FaceShape ratio={ratio} tint={ok ? "#E7BE95" : "#C08A55"} id={id} />
        <div
          style={{
            position: "absolute",
            top: 2,
            right: 0,
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: ok ? GREEN : RED,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            ...text(46, 700, "#171310"),
          }}
        >
          {ok ? "✓" : "✕"}
        </div>
      </div>
      <div style={{ ...text(40, 700, ok ? GREEN : RED), marginTop: 4 }}>{label}</div>
    </div>
  );

  return (
    <SceneFrame index="la limite qu'on ne dit jamais" title="elle veut un visage fin">
      <Stage>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          <div style={{ display: "flex", gap: 40, alignItems: "flex-end" }}>
            <Card p={long} ratio={1} label="fin, allongé" ok id="long" />
            <Card p={round} ratio={0} label="plutôt rond" ok={false} id="round" />
          </div>
          <div
            style={{
              ...text(40, 700, RED),
              opacity: verdict,
              transform: `scale(${0.92 + verdict * 0.08})`,
            }}
          >
            ça a tendance à grossir
          </div>
        </div>
      </Stage>
    </SceneFrame>
  );
};

/** What he does instead: adapt it, rather than copy it. */
export const Adapt: React.FC = () => {
  const grow = useSpring();
  const copy = grow(4);
  const arrow = grow(14);
  const mine = grow(22);

  const Pill: React.FC<{ p: number; label: string; tone: string; dim?: boolean }> = ({
    p,
    label,
    tone,
    dim,
  }) => (
    <div
      style={{
        padding: "22px 34px",
        borderRadius: 26,
        border: `3px solid ${tone}`,
        background: `${tone}1A`,
        ...text(38, 700, dim ? theme.mute : theme.paper),
        textAlign: "center",
        opacity: p,
        transform: `translateY(${(1 - p) * 22}px)`,
        textDecoration: dim ? "line-through" : undefined,
        textDecorationColor: RED,
      }}
    >
      {label}
    </div>
  );

  return (
    <SceneFrame index="ce que je fais" title="on l'adapte">
      <Stage>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
          <Pill p={copy} label="la copie identique" tone={RED} dim />
          <div
            style={{
              ...text(58, 700, theme.warm),
              opacity: arrow,
              transform: `translateY(${(1 - arrow) * -10}px)`,
            }}
          >
            ↓
          </div>
          <Pill p={mine} label="ta morphologie d'abord" tone={theme.warm} />
        </div>
      </Stage>
    </SceneFrame>
  );
};

/** The CTA: the booking line, with a ring that keeps pulsing behind it. */
export const CtaStyle: React.FC<Beat> = ({ at }) => {
  const frame = useCurrentFrame();
  const grow = useSpring();
  const card = grow(6);
  // on "viens nous en discuter", not on "rendez-vous": keyed to the last two
  // words the button had 0.8 s on screen, most of it still springing in
  const line = grow(at(24.0));
  const pulse = 1 + Math.sin(Math.max(0, frame - at(25.2)) / 6) * 0.05;

  return (
    <SceneFrame index="à toi" title={"on regarde\nsi elle te va"}>
      <Stage>
        <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div
            style={{
              position: "absolute",
              width: 430,
              height: 430,
              borderRadius: "50%",
              border: `3px solid rgba(255,201,138,0.35)`,
              transform: `scale(${card * pulse})`,
              opacity: card * 0.9,
              boxShadow: "0 0 90px rgba(255,201,138,0.28)",
            }}
          />
          <div
            style={{
              padding: "22px 56px",
              borderRadius: 999,
              background: theme.warm,
              ...text(52, 700, "#171310"),
              transform: `scale(${line * pulse})`,
              opacity: line,
            }}
          >
            prends rendez-vous
          </div>
        </div>
      </Stage>
    </SceneFrame>
  );
};
