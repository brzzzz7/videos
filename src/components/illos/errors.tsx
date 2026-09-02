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

/** 01 · 02 · 03, with the second one flagged — he says it will be yours. */
export const Counter: React.FC = () => {
  const grow = useSpring();
  return (
    <SceneFrame index="au programme" title="3 erreurs">
      <Stage>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
          <div style={{ display: "flex", gap: 26 }}>
            {["01", "02", "03"].map((n, i) => {
              const p = grow(6 + i * 8);
              const on = i === 1;
              return (
                <div
                  key={n}
                  style={{
                    width: 190,
                    height: 190,
                    borderRadius: 38,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: on ? theme.warm : "rgba(255,255,255,0.07)",
                    border: `3px solid ${on ? theme.warm : "rgba(255,255,255,0.2)"}`,
                    ...text(82, 700, on ? "#171310" : theme.paper),
                    opacity: p,
                    transform: `scale(${0.7 + p * 0.3}) rotate(${(1 - p) * (i - 1) * 7}deg)`,
                    boxShadow: on ? "0 0 60px rgba(255,201,138,0.4)" : undefined,
                  }}
                >
                  {n}
                </div>
              );
            })}
          </div>
          <div style={{ ...text(42, 700, theme.warm), opacity: grow(34) }}>
            la 2 va te concerner
          </div>
        </div>
      </Stage>
    </SceneFrame>
  );
};

/** Erreur 01 — waiting too long does not grow hair, it wrecks the ends. */
export const Wait: React.FC<Beat> = ({ at }) => {
  const frame = useCurrentFrame();
  const weeks = interpolate(frame, [8, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shown = Math.round(interpolate(weeks, [0, 1], [4, 14]));
  const verdict = fade(frame, at(9.1), 14);

  return (
    <SceneFrame index="erreur 01" title="attendre trop longtemps">
      <Stage>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
            <div style={{ ...text(150, 700, RED), letterSpacing: -6, lineHeight: 1 }}>
              {shown}
            </div>
            <div style={text(48, 700)}>semaines</div>
          </div>

          {/* a strand that frays at the tip rather than getting longer */}
          <svg width="700" height="150" viewBox="0 0 700 150">
            <path
              d="M20 75 Q180 46 340 75 Q500 104 660 75"
              fill="none" stroke={theme.warm} strokeWidth="12" strokeLinecap="round"
            />
            {Array.from({ length: 5 }).map((_, i) => (
              <path
                key={i}
                d={`M${560 + i * 24} 75 Q${586 + i * 24} ${58 + (i % 2) * 34} ${612 + i * 24} ${44 + (i % 2) * 62}`}
                fill="none" stroke={RED} strokeWidth="7" strokeLinecap="round"
                opacity={verdict}
              />
            ))}
          </svg>

          <div style={{ display: "flex", gap: 18, alignItems: "center", opacity: verdict }}>
            <div
              style={{
                ...text(34, 700, theme.mute),
                padding: "12px 24px",
                borderRadius: 999,
                border: "2px solid rgba(255,255,255,0.2)",
                textDecoration: "line-through",
                textDecorationColor: RED,
              }}
            >
              ça pousse plus vite
            </div>
            <div
              style={{
                ...text(34, 700, RED),
                padding: "12px 24px",
                borderRadius: 999,
                border: `2px solid ${RED}`,
                background: "rgba(255,107,90,0.12)",
              }}
            >
              ça abîme
            </div>
          </div>
        </div>
      </Stage>
    </SceneFrame>
  );
};

/** Erreur 02 — the same tube for five years, never checked against your hair. */
export const Product: React.FC<Beat> = ({ at }) => {
  const grow = useSpring();
  const tub = grow(6);

  return (
    <SceneFrame index="erreur 02" title="le même produit depuis 5 ans">
      <Stage>
        <div style={{ display: "flex", alignItems: "center", gap: 44 }}>
          <div style={{ position: "relative", opacity: tub, transform: `scale(${0.88 + tub * 0.12})` }}>
            <svg width="420" height="462" viewBox="0 0 200 220">
              <rect x="62" y="8" width="76" height="26" rx="9" fill="rgba(255,255,255,0.55)" />
              <rect x="36" y="34" width="128" height="170" rx="26" fill={theme.warm} />
              <rect x="52" y="86" width="96" height="64" rx="12" fill="rgba(23,19,16,0.35)" />
              <text
                x="100" y="128" textAnchor="middle"
                fontSize="40" fontWeight="700" fill="#171310"
                fontFamily="Montserrat"
              >
                5 ans
              </text>
            </svg>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20, width: 520 }}>
            {["ton cuir chevelu a changé", "tes cheveux aussi", "le produit, non"].map((line, i) => {
              const p = grow(at(15.3) + i * 10);
              const last = i === 2;
              return (
                <div
                  key={line}
                  style={{
                    ...text(40, 600, last ? RED : theme.paper),
                    padding: "20px 28px",
                    borderRadius: 22,
                    background: last ? "rgba(255,107,90,0.14)" : "rgba(255,255,255,0.07)",
                    border: `2px solid ${last ? RED : "rgba(255,255,255,0.16)"}`,
                    opacity: p,
                    transform: `translateX(${(1 - p) * 30}px)`,
                  }}
                >
                  {line}
                </div>
              );
            })}
          </div>
        </div>
      </Stage>
    </SceneFrame>
  );
};

/** Erreur 03 — trending is not the same as suiting your face. */
export const Trend: React.FC<Beat> = ({ at }) => {
  const frame = useCurrentFrame();
  const grow = useSpring();
  const tag = grow(6);
  const face = grow(at(21.3));
  const verdict = fade(frame, at(22.6), 14);

  return (
    <SceneFrame index="erreur 03 · la plus fréquente" title="tendance ≠ pour toi">
      <Stage>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
          <div style={{ display: "flex", gap: 40, alignItems: "center" }}>
            <div
              style={{
                ...text(56, 700, "#171310"),
                background: theme.warm,
                padding: "26px 46px",
                borderRadius: 26,
                opacity: tag,
                transform: `translateY(${(1 - tag) * 20}px) rotate(-3deg)`,
              }}
            >
              # tendance
            </div>
            <div style={{ ...text(68, 700, theme.mute), opacity: verdict }}>vs</div>
            <div style={{ opacity: face, transform: `scale(${0.86 + face * 0.14})` }}>
              <svg width="300" height="350" viewBox="0 0 140 170">
                <ellipse cx="70" cy="82" rx="58" ry="76" fill="#E7BE95" />
                <path
                  d="M12 62 Q70 -8 128 62 Q70 26 12 62 Z"
                  fill="#3A2718"
                />
                <ellipse cx="48" cy="86" rx="6" ry="8" fill="#3A2718" />
                <ellipse cx="92" cy="86" rx="6" ry="8" fill="#3A2718" />
              </svg>
            </div>
          </div>

          <div
            style={{
              ...text(50, 700, GREEN),
              opacity: verdict,
              transform: `scale(${0.92 + verdict * 0.08})`,
              textAlign: "center",
            }}
          >
            la forme de ton visage décide
          </div>
        </div>
      </Stage>
    </SceneFrame>
  );
};

/** The CTA: it starts with a real diagnosis. */
export const CtaErrors: React.FC<Beat> = ({ at }) => {
  const frame = useCurrentFrame();
  const grow = useSpring();
  const card = grow(6);
  const line = grow(at(29.9));
  const pulse = 1 + Math.sin(Math.max(0, frame - at(30.2)) / 6) * 0.05;

  return (
    <SceneFrame index="par où on commence" title={"un vrai\ndiagnostic"}>
      <Stage>
        <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div
            style={{
              position: "absolute",
              width: 430,
              height: 430,
              borderRadius: "50%",
              border: "3px solid rgba(255,201,138,0.35)",
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
