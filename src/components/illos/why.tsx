import React from "react";
import { useCurrentFrame } from "remotion";

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
 * A head face-on; `ratio` 1 is long and narrow, 0 is round.
 *
 * The hair is the whole skull in dark with the face laid over it below a
 * straight fringe — the same construction as the Style reel, and for the same
 * reason: a thin dark rim around the ellipse reads as a bald egg, and this reel
 * is about faces and the lines that suit them.
 *
 * `id` must be id-safe: it ends up inside url(#...). Keyed on a French label
 * once before, `url(#face-fin, allongé)` silently matched nothing.
 */
const Face: React.FC<{
  ratio: number;
  tint: string;
  size?: number;
  lines?: number;
  id: string;
}> = ({ ratio, tint, size = 400, lines = 0, id }) => {
  const cx = 110;
  const cy = 136;
  const rx = 96 - ratio * 22;
  const ry = 96 + ratio * 38;
  const fringe = cy - ry * 0.44;

  return (
    <svg width={size} height={size * 1.18} viewBox="0 0 220 260">
      <defs>
        <clipPath id={`why-${id}`}>
          <rect x="0" y={fringe} width="220" height="260" />
        </clipPath>
      </defs>
      <ellipse cx={cx} cy={cy} rx={rx + 6} ry={ry + 6} fill="#3A2718" />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={tint} clipPath={`url(#why-${id})`} />
      <ellipse cx={cx - rx * 0.4} cy={cy - ry * 0.06} rx="9" ry="12" fill="#3A2718" opacity="0.85" />
      <ellipse cx={cx + rx * 0.4} cy={cy - ry * 0.06} rx="9" ry="12" fill="#3A2718" opacity="0.85" />
      <path
        d={`M${cx - rx * 0.3} ${cy + ry * 0.42} Q${cx} ${cy + ry * 0.52} ${cx + rx * 0.3} ${cy + ry * 0.42}`}
        fill="none" stroke="#3A2718" strokeWidth="7" strokeLinecap="round" opacity="0.7"
      />
      {/* the construction lines a morphology reading actually draws */}
      {lines > 0 ? (
        <g stroke={theme.warm} strokeWidth="3" opacity={lines}>
          <line x1={cx - rx} y1={cy - ry * 0.18} x2={cx + rx} y2={cy - ry * 0.18} strokeDasharray="7 7" />
          <line x1={cx - rx} y1={cy + ry * 0.32} x2={cx + rx} y2={cy + ry * 0.32} strokeDasharray="7 7" />
          <line x1={cx} y1={cy - ry} x2={cx} y2={cy + ry} strokeDasharray="7 7" />
          <line x1={cx - rx * 0.9} y1={fringe} x2={cx + rx * 0.9} y2={fringe} strokeWidth="5" />
        </g>
      ) : null}
    </svg>
  );
};

/** How he used to work: a photo comes in, you reproduce it, full stop. */
export const Photo: React.FC = () => {
  const frame = useCurrentFrame();
  const grow = useSpring();
  const phone = grow(4);
  const arrow = grow(16);
  const out = grow(26);
  const dot = fade(frame, 38, 12);

  return (
    <SceneFrame index="avant" title="montre / reproduis / point">
      <Stage>
        <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
          <div style={{ opacity: phone, transform: `scale(${0.86 + phone * 0.14})` }}>
            <svg width="290" height="504" viewBox="0 0 230 400">
              <rect x="6" y="6" width="218" height="388" rx="34" fill="rgba(255,255,255,0.1)"
                    stroke="rgba(255,255,255,0.4)" strokeWidth="6" />
              <rect x="24" y="30" width="182" height="340" rx="20" fill="#171310" />
              <ellipse cx="115" cy="176" rx="56" ry="74" fill="#3A2718" />
              <ellipse cx="115" cy="184" rx="50" ry="68" fill="#E7BE95" />
            </svg>
          </div>
          <div style={{ ...text(64, 700, theme.warm), opacity: arrow }}>→</div>
          <div style={{ opacity: out, transform: `scale(${0.86 + out * 0.14})` }}>
            <Face ratio={1} tint="#E7BE95" size={330} id="out" />
          </div>
          <div style={{ ...text(72, 700, RED), opacity: dot }}>.</div>
        </div>
      </Stage>
    </SceneFrame>
  );
};

/** The same cut on two faces gave two different results. */
export const TwoFaces: React.FC<Beat> = ({ at }) => {
  const frame = useCurrentFrame();
  const grow = useSpring();
  const one = grow(6);
  const two = grow(at(16.2));
  const verdict = fade(frame, at(17.0), 12);

  return (
    <SceneFrame index="ce que je voyais" title="deux résultats">
      <Stage>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          <div style={{ display: "flex", gap: 40, alignItems: "flex-end" }}>
            <div style={{ opacity: one, transform: `scale(${0.9 + one * 0.1})` }}>
              <Face ratio={1} tint="#E7BE95" size={400} id="long" />
            </div>
            <div style={{ opacity: two, transform: `scale(${0.9 + two * 0.1})` }}>
              <Face ratio={0} tint="#C08A55" size={400} id="round" />
            </div>
          </div>
          <div
            style={{
              ...text(50, 700, RED),
              opacity: verdict,
              transform: `scale(${0.92 + verdict * 0.08})`,
            }}
          >
            même coupe, rendu opposé
          </div>
        </div>
      </Stage>
    </SceneFrame>
  );
};

/** Fashionable, and doing nothing for the person wearing it. */
export const Trend: React.FC<Beat> = ({ at }) => {
  const frame = useCurrentFrame();
  const grow = useSpring();
  const tag = grow(6);
  const verdict = fade(frame, at(21.2), 12);

  return (
    <SceneFrame index="ce qui me frustrait" title="à la mode, et c'est tout">
      <Stage>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
          <div
            style={{
              ...text(62, 700, "#171310"),
              background: theme.warm,
              padding: "26px 46px",
              borderRadius: 26,
              opacity: tag,
              transform: `translateY(${(1 - tag) * 20}px) rotate(-3deg)`,
            }}
          >
            # à la mode
          </div>
          <div
            style={{
              ...text(46, 700, RED),
              padding: "22px 38px",
              borderRadius: 999,
              border: `2px solid ${RED}`,
              background: "rgba(255,107,90,0.12)",
              opacity: verdict,
              transform: `scale(${0.92 + verdict * 0.08})`,
              textAlign: "center",
            }}
          >
            mais ça ne les mettait pas en valeur
          </div>
        </div>
      </Stage>
    </SceneFrame>
  );
};

/** The turn: learning to read a face rather than copy a picture. */
export const Declic: React.FC<Beat> = ({ at }) => {
  const frame = useCurrentFrame();
  const grow = useSpring();
  const head = grow(6);
  const lines = fade(frame, at(25.3), 18);
  const verdict = fade(frame, at(26.6), 14);

  return (
    <SceneFrame index="le déclic" title="apprendre à lire un visage">
      <Stage>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          <div style={{ opacity: head, transform: `scale(${0.9 + head * 0.1})` }}>
            <Face ratio={0.8} tint="#E7BE95" size={470} lines={lines} id="read" />
          </div>
          <div
            style={{
              ...text(46, 700, theme.warm),
              opacity: verdict,
              textAlign: "center",
            }}
          >
            quelle ligne va sur quel visage
          </div>
        </div>
      </Stage>
    </SceneFrame>
  );
};

/** Since then: no cut without a real diagnosis. */
export const Diag: React.FC<Beat> = ({ at }) => {
  const grow = useSpring();
  const rows = [
    { label: "la forme du visage", at: 30.2 },
    { label: "les proportions", at: 30.9 },
    { label: "ce qui tient chez toi", at: 31.6 },
  ];

  return (
    <SceneFrame index="depuis" title="jamais sans diagnostic">
      <Stage>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          {rows.map((r) => {
            const p = grow(at(r.at));
            return (
              <div
                key={r.label}
                style={{
                  width: 830,
                  display: "flex",
                  alignItems: "center",
                  gap: 22,
                  padding: "22px 30px",
                  borderRadius: 22,
                  background: "rgba(255,201,138,0.1)",
                  border: `2px solid ${theme.warm}`,
                  ...text(46, 700, theme.paper),
                  opacity: p,
                  transform: `translateX(${(1 - p) * -34}px)`,
                }}
              >
                <span style={{ color: GREEN }}>✓</span>
                {r.label}
              </div>
            );
          })}
          <div style={{ ...text(42, 700, theme.mute), opacity: grow(at(32.4)) }}>
            plus long — et rien à voir
          </div>
        </div>
      </Stage>
    </SceneFrame>
  );
};

/** The question he starts from, against the one he doesn't. */
export const CtaWhy: React.FC<Beat> = ({ at }) => {
  const frame = useCurrentFrame();
  const grow = useSpring();
  const mine = grow(6);
  const theirs = fade(frame, at(37.4), 12);
  const line = grow(at(37.9));
  const pulse = 1 + Math.sin(Math.max(0, frame - at(38.1)) / 6) * 0.05;

  return (
    <SceneFrame index="chez moi" title="la première question">
      <Stage>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          <div
            style={{
              ...text(56, 700, GREEN),
              padding: "26px 44px",
              borderRadius: 26,
              border: `3px solid ${GREEN}`,
              background: "rgba(123,216,143,0.12)",
              opacity: mine,
              transform: `translateY(${(1 - mine) * 22}px)`,
              textAlign: "center",
            }}
          >
            c'est quoi ton visage ?
          </div>
          <div
            style={{
              ...text(40, 700, theme.mute),
              padding: "18px 32px",
              borderRadius: 26,
              border: "2px solid rgba(255,255,255,0.2)",
              textDecoration: "line-through",
              textDecorationColor: RED,
              opacity: theirs,
            }}
          >
            c'est quoi la tendance ?
          </div>

          <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center", marginTop: 8 }}>
            <div
              style={{
                position: "absolute",
                width: 360,
                height: 360,
                borderRadius: "50%",
                border: "3px solid rgba(255,201,138,0.35)",
                transform: `scale(${line * pulse})`,
                opacity: line * 0.9,
                boxShadow: "0 0 90px rgba(255,201,138,0.28)",
              }}
            />
            <div
              style={{
                padding: "24px 58px",
                borderRadius: 999,
                background: theme.warm,
                ...text(54, 700, "#171310"),
                transform: `scale(${line * pulse})`,
                opacity: line,
              }}
            >
              prends rendez-vous
            </div>
          </div>
        </div>
      </Stage>
    </SceneFrame>
  );
};
