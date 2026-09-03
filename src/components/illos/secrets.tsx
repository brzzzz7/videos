import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

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

/** 01 — you ask, and the answer is yes whether or not it is true. */
export const Yes: React.FC<Beat> = ({ at }) => {
  const frame = useCurrentFrame();
  const grow = useSpring();
  const ask = grow(6);
  const yes = grow(at(6.5));
  const truth = fade(frame, at(7.4), 14);

  const Bubble: React.FC<{
    p: number;
    who: string;
    line: string;
    tone: string;
    mine: boolean;
  }> = ({ p, who, line, tone, mine }) => (
    <div
      style={{
        alignSelf: mine ? "flex-start" : "flex-end",
        width: "100%",
        opacity: p,
        transform: `translateX(${(1 - p) * (mine ? -36 : 36)}px)`,
      }}
    >
      <div style={{ ...text(34, 600, theme.mute), marginBottom: 12, marginLeft: 12 }}>
        {who}
      </div>
      <div
        style={{
          padding: "32px 40px",
          borderRadius: 34,
          borderBottomLeftRadius: mine ? 8 : 30,
          borderBottomRightRadius: mine ? 30 : 8,
          background: mine ? "rgba(255,255,255,0.1)" : `${tone}26`,
          border: `2px solid ${tone}`,
          ...text(54, 700),
        }}
      >
        {line}
      </div>
    </div>
  );

  return (
    <SceneFrame index="secret 01" title="la réponse est toujours oui">
      <Stage>
        <div style={{ display: "flex", flexDirection: "column", gap: 26, width: 940 }}>
          <Bubble p={ask} who="toi" line="« ça me va bien ? »" tone="rgba(255,255,255,0.25)" mine />
          <Bubble p={yes} who="lui, ciseaux en main" line="« ouais, nickel »" tone={theme.warm} mine={false} />
          <div
            style={{
              alignSelf: "center",
              marginTop: 6,
              ...text(46, 700, RED),
              opacity: truth,
              transform: `scale(${0.92 + truth * 0.08})`,
            }}
          >
            même quand c'est pas le cas
          </div>
        </div>
      </Stage>
    </SceneFrame>
  );
};

/** 02 — the salon look is products and a professional dryer. */
export const Salon: React.FC<Beat> = ({ at }) => {
  const grow = useSpring();
  const items = [
    { label: "produits", at: 15.0 },
    { label: "brushing pro", at: 15.9 },
    { label: "10 min sur toi", at: 16.7 },
  ];

  return (
    <SceneFrame index="secret 02" title="l'effet sortie de salon">
      <Stage>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
          <div style={{ display: "flex", gap: 22 }}>
            {items.map((it) => {
              const p = grow(at(it.at));
              return (
                <div
                  key={it.label}
                  style={{
                    width: 300,
                    padding: "34px 20px",
                    borderRadius: 28,
                    border: `3px solid ${theme.warm}`,
                    background: "rgba(255,201,138,0.12)",
                    ...text(40, 700, theme.warm),
                    textAlign: "center",
                    opacity: p,
                    transform: `translateY(${(1 - p) * 26}px) scale(${0.9 + p * 0.1})`,
                  }}
                >
                  {it.label}
                </div>
              );
            })}
          </div>
          <div style={{ ...text(48, 700, theme.paper), opacity: grow(at(16.9)), textAlign: "center" }}>
            = c'est pas ta coupe, c'est le coiffage
          </div>
        </div>
      </Stage>
    </SceneFrame>
  );
};

/** 03 — the real test is the next morning, on your own. */
export const Morning: React.FC<Beat> = ({ at }) => {
  const frame = useCurrentFrame();
  const grow = useSpring();
  const clock = grow(6);
  const verdict = fade(frame, at(21.4), 14);
  // the hands run from the evening to the next morning
  const spin = interpolate(frame, [8, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const hours = 12 * spin;

  return (
    <SceneFrame index="le vrai test" title="le lendemain matin">
      <Stage>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
          <div style={{ opacity: clock, transform: `scale(${0.88 + clock * 0.12})` }}>
            <svg width="520" height="520" viewBox="0 0 340 340">
              <circle cx="170" cy="170" r="150" fill="rgba(255,255,255,0.05)"
                      stroke="rgba(255,255,255,0.22)" strokeWidth="6" />
              {Array.from({ length: 12 }).map((_, i) => {
                const a = (i / 12) * Math.PI * 2;
                return (
                  <circle
                    key={i}
                    cx={170 + Math.sin(a) * 122}
                    cy={170 - Math.cos(a) * 122}
                    r={i % 3 === 0 ? 8 : 5}
                    fill={i % 3 === 0 ? theme.warm : "rgba(255,255,255,0.35)"}
                  />
                );
              })}
              <line
                x1="170" y1="170"
                x2={170 + Math.sin((hours / 12) * Math.PI * 2) * 72}
                y2={170 - Math.cos((hours / 12) * Math.PI * 2) * 72}
                stroke={theme.paper} strokeWidth="12" strokeLinecap="round"
              />
              <line
                x1="170" y1="170"
                x2={170 + Math.sin(hours * Math.PI * 2) * 116}
                y2={170 - Math.cos(hours * Math.PI * 2) * 116}
                stroke={theme.warm} strokeWidth="8" strokeLinecap="round"
              />
              <circle cx="170" cy="170" r="14" fill={theme.warm} />
            </svg>
          </div>
          <div
            style={{
              ...text(52, 700, GREEN),
              opacity: verdict,
              transform: `scale(${0.92 + verdict * 0.08})`,
              textAlign: "center",
            }}
          >
            toute seule, sans rien faire
          </div>
        </div>
      </Stage>
    </SceneFrame>
  );
};

/** 04 — no cut suits everyone; the face decides. */
export const Everyone: React.FC<Beat> = ({ at }) => {
  const frame = useCurrentFrame();
  const grow = useSpring();
  const claim = grow(6);
  const strike = fade(frame, at(25.5), 12);
  const faces = grow(at(27.0));

  const Face: React.FC<{ ratio: number; tint: string; d: number }> = ({ ratio, tint, d }) => {
    const p = grow(at(27.0) + d);
    const rx = 62 - ratio * 14;
    const ry = 62 + ratio * 24;
    return (
      <svg width="268" height="313" viewBox="0 0 150 175" style={{ opacity: p }}>
        <ellipse cx="75" cy="84" rx={rx + 5} ry={ry + 5} fill="#3A2718" />
        <ellipse cx="75" cy="92" rx={rx} ry={ry} fill={tint} />
        <ellipse cx={75 - rx * 0.4} cy="86" rx="5" ry="7" fill="#3A2718" />
        <ellipse cx={75 + rx * 0.4} cy="86" rx="5" ry="7" fill="#3A2718" />
      </svg>
    );
  };

  return (
    <SceneFrame index="secret 03" title="« elle va à tout le monde »">
      <Stage>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
          <div style={{ position: "relative", opacity: claim }}>
            <div
              style={{
                ...text(52, 700, theme.mute),
                padding: "26px 40px",
                borderRadius: 28,
                border: "2px solid rgba(255,255,255,0.22)",
              }}
            >
              aucune coupe ne fait ça
            </div>
            <svg
              width="100%" height="100%" viewBox="0 0 600 100"
              preserveAspectRatio="none"
              style={{ position: "absolute", inset: 0 }}
            >
              <line
                x1="20" y1="50" x2="580" y2="50"
                stroke={RED} strokeWidth="10" strokeLinecap="round"
                strokeDasharray="600" strokeDashoffset={600 * (1 - strike)}
              />
            </svg>
          </div>

          <div style={{ display: "flex", gap: 24, opacity: faces }}>
            <Face ratio={1} tint="#E7BE95" d={0} />
            <Face ratio={0} tint="#C08A55" d={5} />
            <Face ratio={0.6} tint="#D8A87A" d={10} />
          </div>

          <div style={{ ...text(48, 700, theme.warm), opacity: grow(at(27.9)) }}>
            la forme de ton visage décide
          </div>
        </div>
      </Stage>
    </SceneFrame>
  );
};

/** The CTA: two minutes of diagnosis, and the booking ring. */
export const CtaSecrets: React.FC<Beat> = ({ at }) => {
  const frame = useCurrentFrame();
  const grow = useSpring();
  const chip = grow(6);
  const line = grow(at(31.8));
  const pulse = 1 + Math.sin(Math.max(0, frame - at(32.0)) / 6) * 0.05;

  return (
    <SceneFrame index="ce que je fais" title="2 min de diagnostic">
      <Stage>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
          <div
            style={{
              ...text(46, 700, GREEN),
              padding: "22px 38px",
              borderRadius: 999,
              border: `2px solid ${GREEN}`,
              background: "rgba(123,216,143,0.12)",
              opacity: chip,
              transform: `translateY(${(1 - chip) * 20}px)`,
            }}
          >
            la vérité, pas le compliment
          </div>

          <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div
              style={{
                position: "absolute",
                width: 380,
                height: 380,
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
