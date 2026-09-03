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

/** A phone held up with a photo on it — the thing a client arrives with. */
const Phone: React.FC<{ ratio: number; tint: string; scale?: number }> = ({
  ratio,
  tint,
  scale = 1,
}) => {
  const rx = 52 - ratio * 10;
  const ry = 52 + ratio * 18;
  return (
    <svg width={230 * scale} height={400 * scale} viewBox="0 0 230 400">
      <rect x="6" y="6" width="218" height="388" rx="34" fill="rgba(255,255,255,0.1)"
            stroke="rgba(255,255,255,0.4)" strokeWidth="6" />
      <rect x="24" y="30" width="182" height="340" rx="20" fill="#171310" />
      <rect x="90" y="16" width="50" height="9" rx="5" fill="rgba(255,255,255,0.35)" />
      {/* the face in the photo */}
      <ellipse cx="115" cy="180" rx={rx + 4} ry={ry + 4} fill="#3A2718" />
      <ellipse cx="115" cy="188" rx={rx} ry={ry} fill={tint} />
      <ellipse cx={115 - rx * 0.4} cy="182" rx="5" ry="7" fill="#3A2718" />
      <ellipse cx={115 + rx * 0.4} cy="182" rx="5" ry="7" fill="#3A2718" />
    </svg>
  );
};

/** "Je refuse de copier" — the photo, and the copy-paste struck out. */
export const Refus: React.FC = () => {
  const frame = useCurrentFrame();
  const grow = useSpring();
  const p = grow(4);
  const strike = fade(frame, 22, 12);

  return (
    <SceneFrame index="pourquoi je dis non" title="pas de copier-coller">
      <Stage>
        <div style={{ position: "relative", opacity: p, transform: `scale(${0.88 + p * 0.12})` }}>
          <Phone ratio={1} tint="#E7BE95" scale={1.7} />
          <svg
            width="440" height="700" viewBox="0 0 300 470"
            style={{ position: "absolute", top: -16, left: -26 }}
          >
            <line
              x1="34" y1="34" x2="266" y2="436"
              stroke={RED} strokeWidth="20" strokeLinecap="round"
              strokeDasharray="470" strokeDashoffset={470 * (1 - strike)}
            />
          </svg>
        </div>
      </Stage>
    </SceneFrame>
  );
};

/** The same cut on two different faces never lands the same way. */
export const TwoFaces: React.FC<Beat> = ({ at }) => {
  const frame = useCurrentFrame();
  const grow = useSpring();
  const one = grow(6);
  const two = grow(at(9.6));
  const verdict = fade(frame, at(10.3), 12);

  const Face: React.FC<{ p: number; ratio: number; tint: string; label: string }> = ({
    p, ratio, tint, label,
  }) => {
    const rx = 96 - ratio * 22;
    const ry = 96 + ratio * 38;
    return (
      <div style={{ textAlign: "center", opacity: p, transform: `scale(${0.9 + p * 0.1})` }}>
        <svg width="390" height="440" viewBox="0 0 220 260">
          <ellipse cx="110" cy="126" rx={rx + 7} ry={ry + 7} fill="#3A2718" />
          <ellipse cx="110" cy="136" rx={rx} ry={ry} fill={tint} />
          <ellipse cx={110 - rx * 0.4} cy="128" rx="8" ry="11" fill="#3A2718" />
          <ellipse cx={110 + rx * 0.4} cy="128" rx="8" ry="11" fill="#3A2718" />
        </svg>
        <div style={{ ...text(38, 700, theme.mute), marginTop: -22 }}>{label}</div>
      </div>
    );
  };

  return (
    <SceneFrame index="la même coupe" title="deux résultats">
      <Stage>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex", gap: 44, alignItems: "flex-end" }}>
            <Face p={one} ratio={1} tint="#E7BE95" label="visage allongé" />
            <Face p={two} ratio={0} tint="#C08A55" label="visage rond" />
          </div>
          <div
            style={{
              ...text(52, 700, RED),
              opacity: verdict,
              transform: `scale(${0.92 + verdict * 0.08})`,
            }}
          >
            jamais le même rendu
          </div>
        </div>
      </Stage>
    </SceneFrame>
  );
};

/** What flatters one morphology works against another. */
export const Morpho: React.FC<Beat> = ({ at }) => {
  const frame = useCurrentFrame();
  const grow = useSpring();
  const a = grow(6);
  const b = grow(at(13.9));
  const swap = fade(frame, at(13.9), 14);

  const Card: React.FC<{ p: number; label: string; verdict: string; ok: boolean }> = ({
    p, label, verdict, ok,
  }) => (
    <div
      style={{
        width: 580,
        padding: "36px 30px",
        borderRadius: 32,
        border: `3px solid ${ok ? GREEN : RED}`,
        background: ok ? "rgba(123,216,143,0.12)" : "rgba(255,107,90,0.12)",
        textAlign: "center",
        opacity: p,
        transform: `translateY(${(1 - p) * 26}px)`,
      }}
    >
      <div style={{ ...text(40, 600, theme.mute) }}>{label}</div>
      <div style={{ ...text(62, 700, ok ? GREEN : RED), marginTop: 10 }}>{verdict}</div>
    </div>
  );

  return (
    <SceneFrame index="la même coupe" title="selon la morphologie">
      <Stage>
        <div style={{ display: "flex", flexDirection: "column", gap: 26, alignItems: "center" }}>
          <Card p={a} label="sur telle forme" verdict="ça la met en valeur" ok />
          <div style={{ ...text(64, 700, theme.mute), opacity: swap }}>↕</div>
          <Card p={b} label="sur une autre" verdict="ça la dessert" ok={false} />
        </div>
      </Stage>
    </SceneFrame>
  );
};

/** What he keeps from the photo, and what he replaces. */
export const Adapt: React.FC<Beat> = ({ at }) => {
  const grow = useSpring();
  const photo = grow(6);
  const keep1 = grow(at(18.9));
  const keep2 = grow(at(19.5));
  const mine = grow(at(20.2));

  return (
    <SceneFrame index="ce que je garde" title="le style, pas la copie">
      <Stage>
        <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
          <div style={{ opacity: photo, transform: `scale(${0.86 + photo * 0.14})` }}>
            <Phone ratio={1} tint="#E7BE95" scale={1.12} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20, width: 540 }}>
            {[
              { label: "le style", p: keep1 },
              { label: "l'esprit", p: keep2 },
            ].map((it) => (
              <div
                key={it.label}
                style={{
                  ...text(46, 700, theme.warm),
                  padding: "22px 30px",
                  borderRadius: 22,
                  border: `2px solid ${theme.warm}`,
                  background: "rgba(255,201,138,0.12)",
                  opacity: it.p,
                  transform: `translateX(${(1 - it.p) * 34}px)`,
                }}
              >
                ✓ {it.label}
              </div>
            ))}
            <div
              style={{
                ...text(46, 700, "#171310"),
                padding: "22px 30px",
                borderRadius: 22,
                background: theme.warm,
                opacity: mine,
                transform: `translateX(${(1 - mine) * 34}px)`,
              }}
            >
              → adapté à toi
            </div>
          </div>
        </div>
      </Stage>
    </SceneFrame>
  );
};

/** The closing line, with the booking ring. */
export const CtaCopy: React.FC<Beat> = ({ at }) => {
  const frame = useCurrentFrame();
  const grow = useSpring();
  const split = grow(6);
  const line = grow(at(27.4));
  const pulse = 1 + Math.sin(Math.max(0, frame - at(27.6)) / 6) * 0.05;

  return (
    <SceneFrame index="la vraie différence" title={"pas tendance —\nla tienne"}>
      <Stage>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
          <div style={{ display: "flex", gap: 22, opacity: split }}>
            <div
              style={{
                ...text(40, 700, theme.mute),
                padding: "20px 30px",
                borderRadius: 999,
                border: "2px solid rgba(255,255,255,0.22)",
                textDecoration: "line-through",
                textDecorationColor: RED,
              }}
            >
              une coupe tendance
            </div>
            <div
              style={{
                ...text(40, 700, GREEN),
                padding: "20px 30px",
                borderRadius: 999,
                border: `2px solid ${GREEN}`,
                background: "rgba(123,216,143,0.12)",
              }}
            >
              une coupe qui te va
            </div>
          </div>

          <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center", marginTop: 10 }}>
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
                padding: "24px 60px",
                borderRadius: 999,
                background: theme.warm,
                ...text(56, 700, "#171310"),
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
