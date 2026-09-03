import React from "react";
import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import { SANS } from "../../fonts";
import { theme } from "../../theme";
import { IlloFrame, label } from "./frame";

const pop = (frame: number, fps: number, delay = 0) =>
  spring({ frame: frame - delay, fps, config: { damping: 15, stiffness: 190, mass: 0.6 } });

/** 01 · 02 · 03 — the three mistakes, for the hook. */
export const Counter: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <IlloFrame title="au programme">
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 26 }}>
        <div style={{ display: "flex", gap: 26 }}>
          {["01", "02", "03"].map((n, i) => {
            const p = pop(frame, fps, 6 + i * 7);
            return (
              <div
                key={n}
                style={{
                  width: 168,
                  height: 168,
                  borderRadius: 34,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: i === 0 ? theme.warm : "rgba(255,255,255,0.07)",
                  border: `2px solid ${i === 0 ? theme.warm : "rgba(255,255,255,0.18)"}`,
                  color: i === 0 ? "#171310" : theme.paper,
                  fontFamily: SANS,
                  fontWeight: 700,
                  fontSize: 74,
                  transform: `scale(${0.6 + p * 0.4}) rotate(${(1 - p) * (i - 1) * 6}deg)`,
                  opacity: p,
                }}
              >
                {n}
              </div>
            );
          })}
        </div>
        <div style={{ ...label(38, 600), opacity: pop(frame, fps, 26) }}>
          erreurs du matin
        </div>
      </AbsoluteFill>
    </IlloFrame>
  );
};

/** Ring gauge — used for "trop mouillés" (100 %) and "sèche à 80 %". */
export const Gauge: React.FC<{
  from: number;
  to: number;
  caption: string;
  title?: string;
  danger?: boolean;
}> = ({ from, to, caption, title, danger }) => {
  const frame = useCurrentFrame();
  const value = interpolate(frame, [10, 40], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const r = 116;
  const c = 2 * Math.PI * r;
  const colour = danger ? "#FF6B5A" : theme.warm;

  return (
    <IlloFrame title={title}>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ position: "relative", width: 300, height: 300 }}>
          <svg width="300" height="300" viewBox="0 0 300 300">
            <circle cx="150" cy="150" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="20" />
            <circle
              cx="150" cy="150" r={r} fill="none" stroke={colour} strokeWidth="20"
              strokeLinecap="round" strokeDasharray={c}
              strokeDashoffset={c * (1 - value / 100)}
              transform="rotate(-90 150 150)"
            />
          </svg>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ ...label(76, 700), color: colour, lineHeight: 1 }}>
              {Math.round(value)}%
            </div>
            <div style={{ ...label(26, 600), color: "rgba(255,255,255,0.6)", marginTop: 6 }}>
              humidité
            </div>
          </div>
        </div>
        <div style={{ ...label(36, 600), marginTop: 22, textAlign: "center", maxWidth: 760 }}>
          {caption}
        </div>
      </AbsoluteFill>
    </IlloFrame>
  );
};

/** A strand that is stretched, then springs back out of shape. */
export const Strand: React.FC = () => {
  const frame = useCurrentFrame();
  const stretch = interpolate(frame, [8, 26, 34, 52], [0, 1, 1, 0.12], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const settle = interpolate(frame, [34, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = 150 + stretch * 90;
  const messy = 26 * settle;

  return (
    <IlloFrame title="cheveu mouillé">
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <svg width="820" height="330" viewBox="0 0 820 330">
          <path
            d={`M 60 150 C 220 ${150 - messy}, 300 ${y}, 410 ${y} C 520 ${y}, 600 ${150 + messy}, 760 150`}
            fill="none"
            stroke={theme.warm}
            strokeWidth="12"
            strokeLinecap="round"
          />
          {[60, 410, 760].map((cx, i) => (
            <circle key={cx} cx={cx} cy={i === 1 ? y : 150} r="14" fill={theme.paper} />
          ))}
        </svg>
        <div style={{ ...label(36, 600), marginTop: 10, textAlign: "center" }}>
          {settle > 0.5 ? "il reprend sa forme en séchant" : "élastique quand il est mouillé"}
        </div>
      </AbsoluteFill>
    </IlloFrame>
  );
};

/** Wash → dry → style, with the product marker in the right or wrong place. */
export const Timeline: React.FC<{ good: boolean; moveAt?: number }> = ({
  good,
  moveAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const steps = ["lavage", "séchage", "coiffage"];

  // with moveAt the panel tells the whole story: wrong end first, then it slides
  const moved = moveAt === undefined ? good : frame >= moveAt;
  const slide =
    moveAt === undefined
      ? 1
      : spring({ frame: frame - moveAt, fps, config: { damping: 18, stiffness: 90 } });
  const at = moved ? 1 : 2;
  const appear = spring({ frame: frame - 14, fps, config: { damping: 20, stiffness: 110 } });
  const x = moveAt === undefined ? 150 + at * 250 : 650 - slide * 250;
  const colour = moved ? theme.warm : "#FF6B5A";

  return (
    <IlloFrame title={moved ? "le bon moment" : "trop tard"}>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <svg width="820" height="260" viewBox="0 0 820 260">
          <line x1="150" y1="170" x2="650" y2="170" stroke="rgba(255,255,255,0.2)" strokeWidth="6" strokeLinecap="round" />
          {steps.map((s, i) => (
            <g key={s}>
              <circle
                cx={150 + i * 250} cy="170" r="18"
                fill={i === at ? colour : "rgba(255,255,255,0.25)"}
              />
              <text
                x={150 + i * 250} y="224" textAnchor="middle"
                fill="rgba(255,255,255,0.75)" fontFamily={SANS} fontWeight="600" fontSize="26"
              >
                {s}
              </text>
            </g>
          ))}
          <g transform={`translate(${x}, ${112 - appear * 18}) scale(${0.8 + appear * 0.2})`} opacity={appear}>
            <rect x="-34" y="-46" width="68" height="52" rx="12" fill={theme.paper} />
            <rect x="-18" y="-58" width="36" height="14" rx="6" fill="rgba(255,255,255,0.65)" />
          </g>
        </svg>
        <div style={{ ...label(36, 600), marginTop: 4, textAlign: "center", maxWidth: 780 }}>
          {moved ? "produit sur cheveux humides" : "produit à la toute fin"}
        </div>
      </AbsoluteFill>
    </IlloFrame>
  );
};

/** cire · gel · crème */
export const Products: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = ["cire", "gel", "crème"];
  return (
    <IlloFrame title="produits coiffants">
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 40 }}>
          {items.map((name, i) => {
            const p = pop(frame, fps, 6 + i * 9);
            return (
              <div key={name} style={{ textAlign: "center", opacity: p, transform: `translateY(${(1 - p) * 26}px)` }}>
                <div
                  style={{
                    width: 150,
                    height: 132,
                    borderRadius: 22,
                    background: i === 0 ? theme.warm : "rgba(255,255,255,0.1)",
                    border: `2px solid ${i === 0 ? theme.warm : "rgba(255,255,255,0.2)"}`,
                    marginBottom: 16,
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: -16,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 70,
                      height: 20,
                      borderRadius: 8,
                      background: "rgba(255,255,255,0.55)",
                    }}
                  />
                </div>
                <div style={label(32, 600)}>{name}</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </IlloFrame>
  );
};

/** Dose per day: same amount every day is the mistake. */
export const Doses: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // this cue is on screen for nine seconds, so the highlight walks the days
  const active = Math.floor(Math.max(0, frame - 44) / 54) % 3;
  const days = [
    { day: "jour 1", dose: 0.45, note: "cheveux propres" },
    { day: "jour 2", dose: 0.7, note: "" },
    { day: "jour 3", dose: 1, note: "moins d'huile" },
  ];
  return (
    <IlloFrame title="quantité de produit">
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingTop: 40 }}>
        <div style={{ display: "flex", gap: 54, alignItems: "flex-end" }}>
          {days.map((d, i) => {
            const p = pop(frame, fps, 8 + i * 8);
            const size = 62 + d.dose * 92;
            const on = frame > 44 && i === active;
            return (
              <div key={d.day} style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: size,
                    height: size,
                    borderRadius: "50%",
                    margin: "0 auto 18px",
                    background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.9), ${theme.warm})`,
                    transform: `scale(${(0.4 + p * 0.6) * (on ? 1.08 : 1)})`,
                    opacity: p * (frame > 44 && !on ? 0.45 : 1),
                    boxShadow: on ? `0 0 40px rgba(255,201,138,0.45)` : undefined,
                  }}
                />
                <div style={{ ...label(30, 700), opacity: frame > 44 && !on ? 0.5 : 1 }}>
                  {d.day}
                </div>
                <div style={{ ...label(24, 600), color: "rgba(255,255,255,0.55)", marginTop: 4 }}>
                  {d.note}
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </IlloFrame>
  );
};

/** The exception: matte wax on dry hair for volume. */
export const MatteWax: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, 6);
  const rise = interpolate(frame, [12, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <IlloFrame title="l'exception">
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 22 }}>
        <div
          style={{
            padding: "18px 34px",
            borderRadius: 999,
            border: `2px solid ${theme.warm}`,
            ...label(38, 700),
            color: theme.warm,
            transform: `scale(${0.8 + p * 0.2})`,
            opacity: p,
          }}
        >
          cire mate
        </div>
        <svg width="520" height="180" viewBox="0 0 520 180">
          {[0, 1, 2, 3].map((i) => {
            const h = 40 + i * 26;
            const shown = interpolate(rise, [i * 0.2, i * 0.2 + 0.3], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <g key={i} opacity={shown}>
                <line
                  x1={110 + i * 100} y1="150" x2={110 + i * 100} y2={150 - h * shown}
                  stroke={theme.warm} strokeWidth="10" strokeLinecap="round"
                />
                <circle cx={110 + i * 100} cy={150 - h * shown} r="9" fill={theme.paper} />
              </g>
            );
          })}
        </svg>
        <div style={{ ...label(34, 600), textAlign: "center" }}>
          sur cheveux secs, pour le volume
        </div>
      </AbsoluteFill>
    </IlloFrame>
  );
};

/** CTA: the animated card, over the barbershop b-roll. */
export const CtaIllo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const card = pop(frame, fps, 4);
  const bubble = pop(frame, fps, 16);
  const pulse = 1 + Math.sin(frame / 6) * 0.025;
  // a ring leaves the card every second — the animation the CTA was asked for
  const ringPhase = (frame % 30) / 30;
  const nudge = Math.sin(frame / 5) * 6;

  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#0C0C10" }}>
      <AbsoluteFill style={{ opacity: 0.5 }}>
        <OffthreadVideo
          src={staticFile("barber.mp4")}
          trimBefore={40}
          muted
          toneMapped={false}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(12,12,16,0.75) 0%, rgba(12,12,16,0.45) 60%, rgba(12,12,16,0.85) 100%)",
        }}
      />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 24 }}>
        <div
          style={{
            position: "absolute",
            width: 420,
            height: 420,
            borderRadius: "50%",
            border: `3px solid ${theme.warm}`,
            transform: `scale(${0.5 + ringPhase * 0.9})`,
            opacity: (1 - ringPhase) * 0.45 * card,
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 18,
            padding: "22px 38px",
            borderRadius: 26,
            background: theme.paper,
            ...label(40, 700),
            color: "#141115",
            transform: `translateY(${(1 - card) * 30}px) scale(${(0.9 + card * 0.1) * pulse})`,
            opacity: card,
            boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
          }}
        >
          <span
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: theme.warm,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
            }}
          >
            ✉
          </span>
          Envoie-moi un DM
          <span style={{ transform: `translateX(${nudge}px)`, opacity: 0.85 }}>→</span>
        </div>
        <div
          style={{
            ...label(32, 600),
            color: "rgba(255,255,255,0.85)",
            transform: `translateY(${(1 - bubble) * 20}px)`,
            opacity: bubble,
          }}
        >
          ou prends rendez-vous
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
