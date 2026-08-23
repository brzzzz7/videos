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

/* ------------------------------------------------------------------- scenes */

/** 01 — "juste un peu plus court" and he came back shaved. */
export const Shaved: React.FC<Beat> = ({ at }) => {
  const frame = useCurrentFrame();
  // the hair goes while he says "et qui est revenu complètement rasé"
  const hair = interpolate(frame, [at(6.9), at(8.3)], [1, 0.06], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const gone = fade(frame, at(8.0), 12);

  return (
    <SceneFrame index="témoignage 01" title={"« juste un peu\nplus court »"}>
      <Stage>
        <div style={{ position: "relative" }}>
          <Head hair={hair} />
          <div
            style={{
              position: "absolute",
              top: -34,
              left: "50%",
              transform: `translateX(-50%) scale(${0.8 + gone * 0.2}) rotate(-3deg)`,
              opacity: gone,
              ...text(72, 700, "#171310"),
              background: RED,
              padding: "14px 42px",
              borderRadius: 20,
              whiteSpace: "nowrap",
            }}
          >
            RASÉ
          </div>
        </div>
      </Stage>
    </SceneFrame>
  );
};

/** 01b — the numbers: 2 cm asked, three times too short delivered. */
export const Numbers: React.FC<Beat> = ({ at }) => {
  const grow = useSpring();
  const asked = grow(6);
  const got = grow(at(12.3));

  const Card: React.FC<{
    p: number;
    label: string;
    value: string;
    tone: string;
  }> = ({ p, label, value, tone }) => (
    <div
      style={{
        width: 660,
        padding: "44px 30px",
        borderRadius: 34,
        border: `3px solid ${tone}`,
        background: `${tone}1F`,
        textAlign: "center",
        opacity: p,
        transform: `translateY(${(1 - p) * 34}px) scale(${0.9 + p * 0.1})`,
      }}
    >
      <div style={{ ...text(38, 600, theme.mute), letterSpacing: 1 }}>{label}</div>
      <div style={{ ...text(124, 700, tone), marginTop: 12, letterSpacing: -4 }}>
        {value}
      </div>
    </div>
  );

  return (
    <SceneFrame index="le malentendu">
      <Stage>
        <div style={{ display: "flex", flexDirection: "column", gap: 34, alignItems: "center" }}>
          <Card p={asked} label="ce qu'il demande" value="−2 cm" tone={GREEN} />
          <Card p={got} label="ce qu'il reçoit" value="3× trop court" tone={RED} />
        </div>
      </Stage>
    </SceneFrame>
  );
};

/** 02 — two hours of waiting, on a clock that will not stop. */
export const Clock: React.FC<Beat> = ({ at }) => {
  const frame = useCurrentFrame();
  const spin = interpolate(frame, [at(18.6), at(20.9)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const hours = 2 * spin;

  return (
    <SceneFrame index="témoignage 02" title={"2 h d'attente\npour un RDV pris"}>
      <Stage>
        <svg width="580" height="580" viewBox="0 0 340 340">
          <circle cx="170" cy="170" r="150" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.22)" strokeWidth="6" />
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
          {/* the hour hand crawls, the minute hand runs — that is the two hours */}
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
            stroke={RED} strokeWidth="8" strokeLinecap="round"
          />
          <circle cx="170" cy="170" r="14" fill={theme.warm} />
        </svg>
      </Stage>
    </SceneFrame>
  );
};

/** 02b — the appointment that meant nothing. */
export const Appointment: React.FC<Beat> = ({ at }) => {
  const frame = useCurrentFrame();
  const grow = useSpring();
  const bar = interpolate(frame, [at(24.6), at(27.2)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const late = grow(at(26.2));

  return (
    <SceneFrame index="salon mal organisé">
      <Stage>
        <div style={{ width: 900 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div style={text(38, 600, theme.mute)}>rendez-vous</div>
              <div style={{ ...text(112, 700, GREEN), letterSpacing: -4 }}>14:00</div>
            </div>
            <div style={{ textAlign: "right", opacity: late }}>
              <div style={text(38, 600, theme.mute)}>passé à</div>
              <div style={{ ...text(112, 700, RED), letterSpacing: -4 }}>16:05</div>
            </div>
          </div>
          <div
            style={{
              marginTop: 44,
              height: 44,
              borderRadius: 999,
              background: "rgba(255,255,255,0.1)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${bar * 100}%`,
                height: "100%",
                borderRadius: 999,
                background: `linear-gradient(90deg, ${GREEN}, ${theme.warm} 40%, ${RED})`,
              }}
            />
          </div>
          <div style={{ ...text(50, 700, RED), marginTop: 34, textAlign: "center", opacity: late }}>
            2 h assis à attendre
          </div>
        </div>
      </Stage>
    </SceneFrame>
  );
};

/**
 * 03 — the barber who hears none of it.
 *
 * An ear glyph was the obvious choice and did not survive contact: drawn small
 * enough to fit, both the stroked and the filled version read as a blob. A
 * speech bubble struck through cannot be misread at any size.
 */
export const Deaf: React.FC<Beat> = ({ at }) => {
  const frame = useCurrentFrame();
  const grow = useSpring();
  const p = grow(10);
  const strike = fade(frame, at(32.8), 12);

  return (
    <SceneFrame index="témoignage 03" title={"il n'écoute\nrien du tout"}>
      <Stage>
        <div style={{ position: "relative", opacity: p, transform: `scale(${0.86 + p * 0.14})` }}>
          <svg width="600" height="470" viewBox="0 0 300 235">
            <path
              d="M40 16 H260 A28 28 0 0 1 288 44 V156 A28 28 0 0 1 260 184
                 H132 L88 226 V184 H40 A28 28 0 0 1 12 156 V44 A28 28 0 0 1 40 16 Z"
              fill="rgba(255,255,255,0.1)"
              stroke={theme.paper}
              strokeWidth="9"
            />
            {[0, 1, 2].map((i) => (
              <circle
                key={i}
                cx={98 + i * 52}
                cy="100"
                r="15"
                fill={theme.warm}
                opacity={0.55 + i * 0.2}
              />
            ))}
            <line
              x1="34" y1="14" x2="272" y2="212"
              stroke={RED} strokeWidth="20" strokeLinecap="round"
              strokeDasharray="320" strokeDashoffset={320 * (1 - strike)}
            />
          </svg>
        </div>
      </Stage>
    </SceneFrame>
  );
};

/** 03b — what the client said against what the barber did anyway. */
export const Bubbles: React.FC<Beat> = ({ at }) => {
  const frame = useCurrentFrame();
  const grow = useSpring();
  const said = grow(at(38.0));
  const did = grow(at(39.2));
  const verdict = fade(frame, at(40.2), 12);

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
        maxWidth: 820,
        opacity: p,
        transform: `translateX(${(1 - p) * (mine ? -40 : 40)}px)`,
      }}
    >
      <div style={{ ...text(34, 600, theme.mute), marginBottom: 12, marginLeft: 10 }}>
        {who}
      </div>
      <div
        style={{
          padding: "32px 40px",
          borderRadius: 34,
          borderBottomLeftRadius: mine ? 8 : 28,
          borderBottomRightRadius: mine ? 28 : 8,
          background: mine ? "rgba(255,255,255,0.1)" : `${RED}26`,
          border: `2px solid ${tone}`,
          ...text(52, 600),
        }}
      >
        {line}
      </div>
    </div>
  );

  return (
    <SceneFrame index="sa version à lui">
      <Stage>
        <div style={{ display: "flex", flexDirection: "column", gap: 30, width: 940 }}>
          <Bubble p={said} who="le client" line="« voilà ce que je veux »" tone="rgba(255,255,255,0.25)" mine />
          <Bubble p={did} who="le barbier" line="« je fais ma version »" tone={RED} mine={false} />
          <div
            style={{
              alignSelf: "center",
              marginTop: 8,
              ...text(52, 700, RED),
              opacity: verdict,
              transform: `scale(${0.9 + verdict * 0.1})`,
            }}
          >
            frustration garantie
          </div>
        </div>
      </Stage>
    </SceneFrame>
  );
};

/** The CTA: a comment field that fills itself in and posts. */
export const CtaComment: React.FC<Beat> = ({ at }) => {
  const frame = useCurrentFrame();
  const grow = useSpring();
  const box = grow(6);
  const send = grow(at(48.2));
  const typed = interpolate(frame, [at(46.4), at(48.0)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const draft = "ma pire expérience, c'était…";
  const shown = draft.slice(0, Math.round(typed * draft.length));
  const caret = Math.floor(frame / 8) % 2 === 0 && typed < 1;
  const pulse = 1 + Math.sin(Math.max(0, frame - at(48.2)) / 6) * 0.04;

  return (
    <SceneFrame index="à toi" title={"raconte-nous\nton horreur"}>
      <Stage>
        <div style={{ width: 940, opacity: box, transform: `translateY(${(1 - box) * 34}px)` }}>
          {/* the comment field */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              padding: "32px 36px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.08)",
              border: `2px solid ${theme.warm}`,
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
            <div style={{ ...text(46, 600), flex: 1, whiteSpace: "nowrap", overflow: "hidden" }}>
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
            en commentaire ↓
          </div>
        </div>
      </Stage>
    </SceneFrame>
  );
};
