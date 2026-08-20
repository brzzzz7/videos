import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import { SANS } from "../../fonts";
import { theme } from "../../theme";
import { IlloFrame, label } from "./frame";

const pop = (frame: number, fps: number, delay = 0) =>
  spring({ frame: frame - delay, fps, config: { damping: 15, stiffness: 190, mass: 0.6 } });

const fade = (frame: number, at: number, over = 10) =>
  interpolate(frame, [at, at + over], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const RED = "#FF6B5A";

/**
 * Every panel animates against the words underneath it, so its beats are given
 * in SOURCE seconds and converted by `at` (from `cueMark` in price.ts). Holding
 * local frame numbers instead would silently desync each panel the moment the
 * cut list changed.
 */
export type Beat = { at: (seconds: number) => number };

/** A pill of text — the panels are all built out of these. */
const Chip: React.FC<{
  children: React.ReactNode;
  show: number;
  frame: number;
  fps: number;
  tone?: "warm" | "plain" | "bad";
  size?: number;
}> = ({ children, show, frame, fps, tone = "plain", size = 30 }) => {
  const p = pop(frame, fps, show);
  const colours = {
    warm: { bg: "rgba(255,201,138,0.18)", bd: theme.warm, fg: theme.warm },
    plain: { bg: "rgba(255,255,255,0.08)", bd: "rgba(255,255,255,0.2)", fg: theme.paper },
    bad: { bg: "rgba(255,107,90,0.15)", bd: RED, fg: "#FFB3A8" },
  }[tone];
  return (
    <div
      style={{
        padding: "12px 24px",
        borderRadius: 999,
        background: colours.bg,
        border: `2px solid ${colours.bd}`,
        color: colours.fg,
        fontFamily: SANS,
        fontWeight: 600,
        fontSize: size,
        whiteSpace: "nowrap",
        opacity: p,
        transform: `translateY(${(1 - p) * 18}px) scale(${0.86 + p * 0.14})`,
      }}
    >
      {children}
    </div>
  );
};

/** 35 € lands, then the panel asks what is inside it. */
export const PriceTag: React.FC<Beat> = ({ at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const land = pop(frame, fps, at(0.95));
  const open = pop(frame, fps, at(1.6));

  return (
    <IlloFrame title="le vrai prix">
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 18 }}>
        <div
          style={{
            fontFamily: SANS,
            fontWeight: 700,
            fontSize: 190,
            lineHeight: 1,
            letterSpacing: -8,
            color: theme.paper,
            transform: `scale(${0.7 + land * 0.3}) rotate(${(1 - land) * -5}deg)`,
            opacity: land,
            textShadow: "0 10px 40px rgba(0,0,0,0.6)",
          }}
        >
          35 €
        </div>
        {/* the brace that turns a price into a question */}
        <svg width="520" height="60" viewBox="0 0 520 60" style={{ opacity: open }}>
          <path
            d="M20 8 Q20 34 130 34 Q260 34 260 56 Q260 34 390 34 Q500 34 500 8"
            fill="none"
            stroke={theme.warm}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="620"
            strokeDashoffset={620 * (1 - open)}
          />
        </svg>
        <div
          style={{
            ...label(44, 700),
            color: theme.warm,
            opacity: fade(frame, at(2.35)),
            transform: `translateY(${(1 - fade(frame, at(2.35))) * 12}px)`,
          }}
        >
          ça couvre quoi, vraiment ?
        </div>
      </AbsoluteFill>
    </IlloFrame>
  );
};

/** 01 — years of training, then the training that never stops. */
export const Formation: React.FC<Beat> = ({ at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // the bar fills while he says "des années à apprendre des techniques"
  const grow = interpolate(frame, [at(6.88), at(9.25)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const years = Math.round(interpolate(grow, [0, 1], [0, 5]));

  return (
    <IlloFrame title="01 · la formation">
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 30 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16, opacity: fade(frame, at(6.8)) }}>
          <div
            style={{
              fontFamily: SANS,
              fontWeight: 700,
              fontSize: 150,
              lineHeight: 1,
              color: theme.warm,
              letterSpacing: -6,
            }}
          >
            {years}
          </div>
          <div style={label(46, 700)}>ans d'apprentissage</div>
        </div>

        <div
          style={{
            width: 700,
            height: 22,
            borderRadius: 999,
            background: "rgba(255,255,255,0.1)",
            overflow: "hidden",
            opacity: fade(frame, at(6.8)),
          }}
        >
          <div
            style={{
              width: `${grow * 100}%`,
              height: "100%",
              borderRadius: 999,
              background: `linear-gradient(90deg, ${theme.goldDeep}, ${theme.warm})`,
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", maxWidth: 800 }}>
          <Chip frame={frame} fps={fps} show={at(9.9)} tone="warm">+ formation continue</Chip>
          <Chip frame={frame} fps={fps} show={at(10.3)}>nouvelles coupes</Chip>
          <Chip frame={frame} fps={fps} show={at(10.7)}>nouveaux produits</Chip>
        </div>

        {/* the conclusion of the section, on the words "un savoir-faire" */}
        <div
          style={{
            marginTop: 8,
            padding: "14px 34px",
            borderRadius: 20,
            border: `3px solid ${theme.warm}`,
            color: theme.warm,
            fontFamily: SANS,
            fontWeight: 700,
            fontSize: 42,
            letterSpacing: 1,
            textTransform: "uppercase",
            opacity: fade(frame, at(12.35), 12),
            transform: `scale(${0.9 + fade(frame, at(12.35), 12) * 0.1}) rotate(-2deg)`,
          }}
        >
          un savoir-faire
        </div>
      </AbsoluteFill>
    </IlloFrame>
  );
};

/** 02 — what the kit costs, and that it does not last forever. */
export const Material: React.FC<Beat> = ({ at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bars = [
    { name: "supermarché", value: 40, max: 260, tone: "dim" as const },
    { name: "tondeuse pro", value: 260, max: 260, tone: "warm" as const },
  ];
  // he compares the two from 17.5 s to 21.3 s, which is local frame 66 to 180
  const grow = (delay: number) =>
    interpolate(frame, [delay, delay + 46], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  return (
    <IlloFrame title="02 · le matériel">
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 26 }}>
        {bars.map((b, i) => {
          const g = grow(i === 0 ? at(17.6) : at(19.0));
          const width = (b.value / b.max) * 620;
          return (
            <div key={b.name} style={{ width: 760, opacity: fade(frame, i === 0 ? at(17.3) : at(18.7)) }}>
              <div style={{ ...label(30, 600), color: theme.mute, marginBottom: 8 }}>
                {b.name}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div
                  style={{
                    width: width * g,
                    height: 54,
                    borderRadius: 14,
                    background:
                      b.tone === "warm"
                        ? `linear-gradient(90deg, ${theme.goldDeep}, ${theme.warm})`
                        : "rgba(255,255,255,0.16)",
                  }}
                />
                <div
                  style={{
                    ...label(38, 700),
                    color: b.tone === "warm" ? theme.warm : theme.mute,
                  }}
                >
                  {Math.round(b.value * g)} €
                </div>
              </div>
            </div>
          );
        })}

        {/* on "ça s'use, ça se remplace, ça se répare" */}
        <div style={{ display: "flex", gap: 16, marginTop: 14 }}>
          <Chip frame={frame} fps={fps} show={at(21.9)}>ça s'use</Chip>
          <Chip frame={frame} fps={fps} show={at(22.8)}>ça se remplace</Chip>
          <Chip frame={frame} fps={fps} show={at(23.4)}>ça se répare</Chip>
        </div>
      </AbsoluteFill>
    </IlloFrame>
  );
};

/** 03 — the products are not the supermarket ones. */
export const ProductsCompare: React.FC<Beat> = ({ at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = [
    { name: "grande surface", price: "5 €", ok: false },
    { name: "utilisé sur toi", price: "pro", ok: true },
  ];

  return (
    <IlloFrame title="03 · les produits">
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 80, alignItems: "flex-end" }}>
          {items.map((it, i) => {
            const p = pop(frame, fps, i === 0 ? at(24.9) : at(25.4));
            const bottle = it.ok ? theme.warm : "rgba(255,255,255,0.14)";
            return (
              <div
                key={it.name}
                style={{
                  textAlign: "center",
                  opacity: p,
                  transform: `translateY(${(1 - p) * 30}px)`,
                }}
              >
                <div style={{ position: "relative", width: 170, margin: "0 auto 20px" }}>
                  <div
                    style={{
                      width: 74,
                      height: 26,
                      borderRadius: 8,
                      background: "rgba(255,255,255,0.5)",
                      margin: "0 auto -6px",
                    }}
                  />
                  <div
                    style={{
                      width: 170,
                      height: 210,
                      borderRadius: 26,
                      background: bottle,
                      border: `2px solid ${it.ok ? theme.warm : "rgba(255,255,255,0.25)"}`,
                    }}
                  />
                  {!it.ok ? (
                    <svg
                      width="230"
                      height="250"
                      viewBox="0 0 230 250"
                      style={{ position: "absolute", top: -6, left: -30 }}
                    >
                      <line
                        x1="26" y1="24" x2="204" y2="226"
                        stroke={RED} strokeWidth="10" strokeLinecap="round"
                        strokeDasharray="270"
                        strokeDashoffset={270 * (1 - fade(frame, at(27.6), 12))}
                      />
                    </svg>
                  ) : null}
                </div>
                <div style={{ ...label(38, 700), color: it.ok ? theme.warm : theme.mute }}>
                  {it.price}
                </div>
                <div style={{ ...label(28, 600), color: theme.mute, marginTop: 6 }}>
                  {it.name}
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </IlloFrame>
  );
};

/** 04 — a rushed cut against one with the finishing done. */
export const Time: React.FC<Beat> = ({ at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rows = [
    { name: "bâclé", minutes: 10, tone: "bad" as const, delay: at(30.9) },
    { name: "bien fait", minutes: 45, tone: "warm" as const, delay: at(33.5) },
  ];

  return (
    <IlloFrame title="04 · le temps">
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 30 }}>
        {rows.map((r) => {
          const g = interpolate(frame, [r.delay, r.delay + 36], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div key={r.name} style={{ width: 760, opacity: fade(frame, r.delay - 6) }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ ...label(30, 600), color: theme.mute }}>{r.name}</div>
                <div
                  style={{
                    ...label(34, 700),
                    color: r.tone === "warm" ? theme.warm : RED,
                  }}
                >
                  {Math.round(r.minutes * g)} min
                </div>
              </div>
              <div style={{ display: "flex", gap: 7 }}>
                {Array.from({ length: 9 }).map((_, k) => {
                  const filled = g * (r.minutes / 45) * 9 > k;
                  return (
                    <div
                      key={k}
                      style={{
                        flex: 1,
                        height: 40,
                        borderRadius: 8,
                        background: filled
                          ? r.tone === "warm"
                            ? theme.warm
                            : RED
                          : "rgba(255,255,255,0.1)",
                      }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* on "les finitions" */}
        <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
          <Chip frame={frame} fps={fps} show={at(35.1)} tone="warm">contours</Chip>
          <Chip frame={frame} fps={fps} show={at(35.5)} tone="warm">dégradé</Chip>
          <Chip frame={frame} fps={fps} show={at(35.9)} tone="warm">finitions</Chip>
        </div>
      </AbsoluteFill>
    </IlloFrame>
  );
};

/** A cut that holds is a cut you need less often. */
export const Saving: React.FC<Beat> = ({ at }) => {
  const frame = useCurrentFrame();
  const drop = interpolate(frame, [at(38.9), at(40.2)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <IlloFrame title="ce que ça t'économise">
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 34 }}>
        <div style={{ ...label(40, 600), color: theme.mute }}>coupes par an</div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", maxWidth: 780 }}>
          {Array.from({ length: 12 }).map((_, i) => {
            // the last four fade out as the result holds longer
            const dropped = i >= 8;
            const alpha = dropped ? 1 - drop : 1;
            return (
              <div
                key={i}
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: "50%",
                  border: `3px solid ${dropped ? RED : theme.warm}`,
                  background: dropped
                    ? `rgba(255,107,90,${0.22 * alpha})`
                    : "rgba(255,201,138,0.22)",
                  opacity: dropped ? 0.25 + alpha * 0.75 : 1,
                  transform: `scale(${dropped ? 1 - drop * 0.35 : 1})`,
                }}
              />
            );
          })}
        </div>
        <div
          style={{
            ...label(44, 700),
            color: theme.warm,
            opacity: interpolate(frame, [at(39.9), at(40.4)], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          12 → 8 passages
        </div>
      </AbsoluteFill>
    </IlloFrame>
  );
};

/** 05 — the bills that run whether or not anyone sits in the chair. */
export const Charges: React.FC<Beat> = ({ at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // each line lands on the word: loyer, charges, électricité, assurances
  const items = [
    { name: "loyer", show: at(41.35) },
    { name: "charges", show: at(42.85) },
    { name: "électricité", show: at(46.55) },
    { name: "assurances", show: at(48.05) },
  ];

  return (
    <IlloFrame title="05 · ce qu'on ne voit pas">
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 18 }}>
        {items.map((it) => {
          const p = pop(frame, fps, it.show);
          return (
            <div
              key={it.name}
              style={{
                width: 720,
                display: "flex",
                alignItems: "center",
                gap: 22,
                padding: "16px 28px",
                borderRadius: 18,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.14)",
                opacity: p,
                transform: `translateX(${(1 - p) * -40}px)`,
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: theme.warm,
                  flexShrink: 0,
                }}
              />
              <div style={label(38, 600)}>{it.name}</div>
            </div>
          );
        })}
        <div
          style={{
            ...label(34, 700),
            color: RED,
            marginTop: 10,
            opacity: fade(frame, at(48.9), 14),
            textAlign: "center",
          }}
        >
          … avant même de commencer à te couper
        </div>
      </AbsoluteFill>
    </IlloFrame>
  );
};

/**
 * The low-cost trade: the price drops because one of the three is removed.
 *
 * He says "il t'enlève UN de ces points", so exactly one pillar is struck. The
 * mark hunts across the three while he names them and settles on the last one —
 * striking all three, which the first version did, says something he did not.
 */
export const LowCost: React.FC<Beat> = ({ at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pillars = ["la formation", "le matériel", "le temps"];

  // he names the three from 56.4 s to 59.3 s; the mark hunts over that stretch
  // and locks onto the last one as he lands on "le temps passé sur toi"
  const HUNT = at(56.4);
  const LOCK = at(58.5);
  const marked =
    frame >= LOCK ? 2 : frame >= HUNT ? Math.floor((frame - HUNT) / 11) % 3 : -1;

  return (
    <IlloFrame title="le prix cassé">
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 34 }}>
        <div
          style={{
            ...label(40, 700),
            color: RED,
            opacity: fade(frame, at(51.0)),
            letterSpacing: 1,
          }}
        >
          − 40 % … sur quoi ?
        </div>

        <div style={{ display: "flex", gap: 22 }}>
          {pillars.map((name, i) => {
            // they stand up during the pause before he names them
            const p = pop(frame, fps, at(53.7 + i * 0.35));
            const on = marked === i;
            const off = frame >= LOCK && i === 2;
            return (
              <div
                key={name}
                style={{
                  position: "relative",
                  width: 232,
                  height: 190,
                  borderRadius: 24,
                  border: `3px solid ${on ? RED : theme.warm}`,
                  background: on ? "rgba(255,107,90,0.14)" : "rgba(255,201,138,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  padding: 18,
                  opacity: p * (off ? 0.6 : 1),
                  transform: `translateY(${(1 - p) * 24}px) scale(${
                    on ? 1.04 : 1
                  })`,
                  boxShadow: on ? "0 0 44px rgba(255,107,90,0.35)" : undefined,
                }}
              >
                <div style={{ ...label(36, 700), color: on ? "#FFB3A8" : theme.paper }}>
                  {name}
                </div>
                {off ? (
                  <svg
                    width="232"
                    height="190"
                    viewBox="0 0 232 190"
                    style={{ position: "absolute", top: 0, left: 0 }}
                  >
                    <line
                      x1="26" y1="30" x2="206" y2="160"
                      stroke={RED} strokeWidth="8" strokeLinecap="round"
                      strokeDasharray="230"
                      strokeDashoffset={230 * (1 - fade(frame, LOCK, 10))}
                    />
                  </svg>
                ) : null}
              </div>
            );
          })}
        </div>

        <div
          style={{
            ...label(34, 600),
            color: theme.mute,
            opacity: fade(frame, at(52.9), 12),
          }}
        >
          il en saute forcément un
        </div>
      </AbsoluteFill>
    </IlloFrame>
  );
};

/**
 * The CTA animation: the three pillars fly back together into one card, a ring
 * pulses around it and the booking line slides up under it.
 */
export const CtaPrice: React.FC<Beat> = ({ at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const gather = spring({ frame: frame - at(59.95), fps, config: { damping: 20, stiffness: 80 } });
  const card = spring({ frame: frame - at(61.2), fps, config: { damping: 18, stiffness: 110 } });
  const line = spring({ frame: frame - at(63.2), fps, config: { damping: 20, stiffness: 120 } });
  const pulse = 1 + Math.sin(Math.max(0, frame - at(61.6)) / 7) * 0.035;

  // They travel inward but stop on a ring instead of piling up on the centre —
  // collapsing them to one point turned four labels into an unreadable blob.
  const pieces = [
    { name: "formation", x: -300, y: -150, to: -150, ty: -96 },
    { name: "matériel", x: 300, y: -150, to: 150, ty: -96 },
    { name: "temps", x: -300, y: 150, to: -150, ty: 96 },
    { name: "produits", x: 300, y: 150, to: 150, ty: 96 },
  ];

  return (
    <IlloFrame>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        {/* the four items converge on the middle and dissolve into the card */}
        {pieces.map((p, i) => {
          const g = Math.min(1, gather * (1 + i * 0.05));
          const x = p.x + (p.to - p.x) * g;
          const y = p.y + (p.ty - p.y) * g;
          return (
            <div
              key={p.name}
              style={{
                position: "absolute",
                transform: `translate(${x}px, ${y}px) scale(${1 - g * 0.12})`,
                opacity: Math.max(0, 1 - card * 2.2) * Math.min(1, gather * 2),
                padding: "12px 26px",
                borderRadius: 999,
                border: `2px solid ${theme.warm}`,
                color: theme.warm,
                fontFamily: SANS,
                fontWeight: 600,
                fontSize: 32,
              }}
            >
              {p.name}
            </div>
          );
        })}

        {/* the ring that keeps pulsing behind the card */}
        <div
          style={{
            position: "absolute",
            width: 470,
            height: 470,
            borderRadius: "50%",
            border: `3px solid rgba(255,201,138,0.35)`,
            transform: `scale(${card * pulse})`,
            opacity: card * 0.9,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 470,
            height: 470,
            borderRadius: "50%",
            boxShadow: "0 0 90px rgba(255,201,138,0.28)",
            transform: `scale(${card * pulse * 1.04})`,
            opacity: card,
          }}
        />

        <div
          style={{
            textAlign: "center",
            transform: `scale(${0.8 + card * 0.2})`,
            opacity: card,
          }}
        >
          <div
            style={{
              fontFamily: SANS,
              fontWeight: 700,
              fontSize: 62,
              lineHeight: 1.06,
              color: theme.paper,
              letterSpacing: -1.5,
              textShadow: "0 6px 24px rgba(0,0,0,0.55)",
            }}
          >
            viens voir
            <br />
            la différence
          </div>
          <div
            style={{
              marginTop: 26,
              display: "inline-block",
              padding: "16px 40px",
              borderRadius: 999,
              background: theme.warm,
              color: "#171310",
              fontFamily: SANS,
              fontWeight: 700,
              fontSize: 42,
              letterSpacing: -0.5,
              transform: `translateY(${(1 - line) * 34}px) scale(${0.9 + line * 0.1})`,
              opacity: line,
            }}
          >
            prends rendez-vous
          </div>
        </div>
      </AbsoluteFill>
    </IlloFrame>
  );
};
