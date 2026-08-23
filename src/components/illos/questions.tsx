import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

import { theme } from "../../theme";
import {
  fade,
  GREEN,
  Head,
  RED,
  SceneFrame,
  Stage,
  text,
  useSpring,
  type Beat,
} from "./scene-kit";

/** A question card — the same card for all three, only the copy changes. */
export const Ask: React.FC<{ index: string; question: string }> = ({
  index,
  question,
}) => {
  const grow = useSpring();
  const p = grow(8);

  return (
    <SceneFrame index={index}>
      <Stage>
        <div
          style={{
            width: 900,
            padding: "58px 52px",
            borderRadius: 40,
            border: `4px solid ${RED}`,
            background: "rgba(255,107,90,0.1)",
            textAlign: "center",
            opacity: p,
            transform: `translateY(${(1 - p) * 30}px) scale(${0.92 + p * 0.08})`,
          }}
        >
          <div
            style={{
              ...text(72, 700),
              lineHeight: 1.14,
              whiteSpace: "pre-line",
            }}
          >
            {question}
          </div>
        </div>
      </Stage>
    </SceneFrame>
  );
};

/**
 * Q1 — cutting does not change the speed. Two heads grow the same amount; the
 * one that is cut every day just keeps its ends.
 */
export const Genetics: React.FC<Beat> = ({ at }) => {
  const frame = useCurrentFrame();
  const grow = useSpring();
  // both bars fill together while he says "ça change rien du tout"
  const g = interpolate(frame, [at(7.2), at(9.1)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const same = fade(frame, at(9.0), 12);
  const nuance = grow(at(9.9));

  const Column: React.FC<{ label: string; cut: boolean }> = ({ label, cut }) => (
    <div style={{ textAlign: "center", width: 320 }}>
      <div style={{ ...text(32, 600, theme.mute), marginBottom: 18 }}>{label}</div>
      <div
        style={{
          height: 300,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 110,
            height: g * 300,
            borderRadius: "14px 14px 0 0",
            background: `linear-gradient(180deg, ${theme.warm}, ${theme.goldDeep})`,
            // the cut column loses its tips, not its length
            borderTop: cut ? `6px dashed rgba(0,0,0,0.45)` : undefined,
          }}
        />
      </div>
      <div style={{ ...text(34, 700, theme.warm), marginTop: 16 }}>
        {(g * 1.2).toFixed(1)} cm
      </div>
    </div>
  );

  return (
    <SceneFrame index="la vitesse de pousse" title="c'est génétique">
      <Stage>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex", gap: 60 }}>
            <Column label="jamais coupé" cut={false} />
            <Column label="coupé souvent" cut />
          </div>
          <div
            style={{
              ...text(44, 700, GREEN),
              opacity: same,
              transform: `scale(${0.92 + same * 0.08})`,
            }}
          >
            même vitesse
          </div>
          <div
            style={{
              ...text(34, 600, theme.paper),
              opacity: nuance,
              transform: `translateY(${(1 - nuance) * 16}px)`,
              padding: "12px 28px",
              borderRadius: 999,
              border: `2px solid ${theme.warm}`,
            }}
          >
            couper évite juste la casse
          </div>
        </div>
      </Stage>
    </SceneFrame>
  );
};

/**
 * Q2 — the scalp seen from above: hair type changes by zone because the
 * follicles do not all grow in the same direction.
 *
 * The zones sit on the crown itself and each carries its own follicle angle.
 * The first version put the head beside a column of text, which left it small
 * and stranded on one side of the frame, and washed the zones out at 50 %
 * opacity over a colour they barely differed from.
 */
export const Scalp: React.FC<Beat> = ({ at }) => {
  const frame = useCurrentFrame();
  const grow = useSpring();
  const zones = grow(6);
  const arrows = fade(frame, at(19.1), 14);

  const patches = [
    { cx: 148, cy: 148, r: 78, angle: -35, tone: "#B87A45" },
    { cx: 262, cy: 136, r: 68, angle: 45, tone: "#F2B77A" },
    { cx: 132, cy: 268, r: 72, angle: 10, tone: "#8E5A2E" },
    { cx: 258, cy: 262, r: 64, angle: -75, tone: "#FFD9A0" },
  ];

  return (
    <SceneFrame index="d'un côté seulement" title="c'est normal">
      <Stage>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
          <svg width="520" height="520" viewBox="0 0 400 400">
            <defs>
              <clipPath id="crown">
                <ellipse cx="200" cy="200" rx="176" ry="190" />
              </clipPath>
            </defs>
            <ellipse cx="200" cy="200" rx="176" ry="190" fill="#D8A87A" />
            <g clipPath="url(#crown)">
              {patches.map((p, i) => (
                <g key={i} opacity={zones}>
                  <circle cx={p.cx} cy={p.cy} r={p.r} fill={p.tone} />
                  {Array.from({ length: 4 }).map((_, k) => {
                    const a = (p.angle * Math.PI) / 180;
                    const ox = p.cx + (k - 1.5) * 24 * Math.cos(a + Math.PI / 2);
                    const oy = p.cy + (k - 1.5) * 24 * Math.sin(a + Math.PI / 2);
                    const len = 46 * arrows;
                    return (
                      <line
                        key={k}
                        x1={ox - Math.cos(a) * len * 0.4}
                        y1={oy - Math.sin(a) * len * 0.4}
                        x2={ox + Math.cos(a) * len * 0.6}
                        y2={oy + Math.sin(a) * len * 0.6}
                        stroke="#3A2718" strokeWidth="8" strokeLinecap="round"
                        opacity={arrows}
                      />
                    );
                  })}
                </g>
              ))}
            </g>
            <ellipse
              cx="200" cy="200" rx="176" ry="190"
              fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="5"
            />
          </svg>

          <div style={{ ...text(42, 700, theme.warm), opacity: zones, textAlign: "center" }}>
            le type change selon la zone
          </div>
          <div
            style={{
              ...text(34, 600, theme.paper),
              opacity: arrows,
              padding: "16px 30px",
              borderRadius: 20,
              background: "rgba(255,255,255,0.08)",
              border: "2px solid rgba(255,255,255,0.18)",
              textAlign: "center",
            }}
          >
            chaque follicule pousse dans sa direction
          </div>
        </div>
      </Stage>
    </SceneFrame>
  );
};

/** Q3 — the same cut on two different people is not the same cut. */
export const Unique: React.FC<Beat> = ({ at }) => {
  const frame = useCurrentFrame();
  const grow = useSpring();
  const him = grow(6);
  const you = grow(at(31.4));
  const verdict = fade(frame, at(33.3), 12);

  return (
    <SceneFrame index="la photo" title="inspiration, pas garantie">
      <Stage>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
          <div style={{ display: "flex", gap: 70, alignItems: "flex-end" }}>
            <div style={{ textAlign: "center", opacity: him, transform: `scale(${0.9 + him * 0.1})` }}>
              <div style={{ transform: "scale(0.78)", transformOrigin: "50% 100%", height: 470 }}>
                <Head hair={1} tint="#E7BE95" />
              </div>
              <div style={{ ...text(34, 600, theme.mute), marginTop: -26 }}>la photo</div>
            </div>
            <div style={{ textAlign: "center", opacity: you, transform: `scale(${0.9 + you * 0.1})` }}>
              <div style={{ transform: "scale(0.78) scaleX(1.1)", transformOrigin: "50% 100%", height: 470 }}>
                <Head hair={0.55} tint="#A9713F" />
              </div>
              <div style={{ ...text(34, 600, theme.warm), marginTop: -26 }}>toi</div>
            </div>
          </div>
          <div
            style={{
              ...text(46, 700, theme.paper),
              opacity: verdict,
              transform: `scale(${0.92 + verdict * 0.08})`,
            }}
          >
            similaire <span style={{ color: RED }}>≠</span> identique
          </div>
        </div>
      </Stage>
    </SceneFrame>
  );
};

/**
 * The CTA: the twist first — there are no stupid questions — then the comment
 * field types itself and posts.
 */
export const CtaQuestions: React.FC<Beat> = ({ at }) => {
  const frame = useCurrentFrame();
  const grow = useSpring();
  const joke = grow(6);
  const box = grow(at(41.9));
  const send = grow(at(43.9));
  const typed = interpolate(frame, [at(42.6), at(43.8)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const draft = "en fait, moi je me demandais…";
  const shown = draft.slice(0, Math.round(typed * draft.length));
  const caret = Math.floor(frame / 8) % 2 === 0 && typed < 1;
  const pulse = 1 + Math.sin(Math.max(0, frame - at(43.9)) / 6) * 0.04;

  return (
    <SceneFrame index="en vrai" title={"aucune question\nn'est bête"}>
      <Stage>
        <div style={{ width: 900, opacity: joke }}>
          {/* the crossed-out premise: the whole reel was the joke */}
          <div
            style={{
              ...text(40, 600, theme.mute),
              textAlign: "center",
              textDecoration: "line-through",
              textDecorationColor: RED,
              textDecorationThickness: 5,
              marginBottom: 40,
            }}
          >
            les pires questions
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              padding: "32px 36px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.08)",
              border: `2px solid ${theme.warm}`,
              opacity: box,
              transform: `translateY(${(1 - box) * 26}px)`,
            }}
          >
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${theme.warm}, ${theme.goldDeep})`,
                flexShrink: 0,
              }}
            />
            <div style={{ ...text(44, 600), flex: 1, whiteSpace: "nowrap", overflow: "hidden" }}>
              {shown}
              <span style={{ opacity: caret ? 1 : 0, color: theme.warm }}>|</span>
            </div>
          </div>

          <div
            style={{
              margin: "40px auto 0",
              width: "fit-content",
              padding: "22px 56px",
              borderRadius: 999,
              background: theme.warm,
              ...text(52, 700, "#171310"),
              transform: `scale(${send * pulse})`,
              opacity: send,
              boxShadow: `0 0 60px rgba(255,201,138,${0.35 * send})`,
            }}
          >
            pose-la en commentaire ↓
          </div>
        </div>
      </Stage>
    </SceneFrame>
  );
};
