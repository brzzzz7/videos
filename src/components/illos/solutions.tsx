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

/* ------------------------------------------------------------------ helpers */

const text = (size: number, weight = 600, color: string = theme.paper) =>
  ({
    fontFamily: SANS,
    fontWeight: weight,
    fontSize: size,
    color,
    letterSpacing: -0.4,
  }) as const;

const useBeat = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  /** progress of a beat that starts at `at` seconds inside the scene */
  return (at: number, ramp = 0.5) =>
    spring({
      frame: frame - at * fps,
      fps,
      config: { damping: 20, stiffness: 120 / ramp, mass: 0.6 },
    });
};

/** Full-frame background shared by every scene. */
const SceneFrame: React.FC<{
  index?: string;
  title?: string;
  children: React.ReactNode;
}> = ({ index, title, children }) => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, 900], [0, 34], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(110% 70% at 20% 8%, rgba(255,201,138,0.18) 0%, rgba(10,10,13,0) 58%), linear-gradient(180deg, #0B0B0E 0%, #16130F 100%)",
        overflow: "hidden",
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, rgba(0,0,0,0) 1px 76px), repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0 1px, rgba(0,0,0,0) 1px 76px)",
          backgroundPosition: `0 ${drift}px`,
        }}
      />
      {index || title ? (
        <div
          style={{
            position: "absolute",
            top: 150,
            left: 0,
            right: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 18,
          }}
        >
          {index ? (
            <div
              style={{
                ...text(30, 700, "#171310"),
                background: theme.warm,
                padding: "10px 22px",
                borderRadius: 999,
                letterSpacing: 3,
                textTransform: "uppercase",
              }}
            >
              {index}
            </div>
          ) : null}
          {title ? <div style={text(74, 700)}>{title}</div> : null}
        </div>
      ) : null}
      {children}
    </AbsoluteFill>
  );
};

/** Row of chips that appear one after another. */
const Chips: React.FC<{
  items: { label: string; at: number; tone?: "warm" | "plain" | "alert" }[];
  size?: number;
}> = ({ items, size = 34 }) => {
  const beat = useBeat();
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 18 }}>
      {items.map((item) => {
        const p = beat(item.at);
        const tone =
          item.tone === "warm"
            ? { border: theme.warm, color: theme.warm }
            : item.tone === "alert"
              ? { border: "#FF6B5A", color: "#FF6B5A" }
              : { border: "rgba(255,255,255,0.28)", color: theme.paper };
        return (
          <div
            key={item.label}
            style={{
              ...text(size, 600, tone.color),
              padding: "14px 26px",
              borderRadius: 999,
              border: `2px solid ${tone.border}`,
              background: "rgba(255,255,255,0.04)",
              transform: `translateY(${(1 - p) * 18}px) scale(${0.9 + p * 0.1})`,
              opacity: p,
            }}
          >
            {item.label}
          </div>
        );
      })}
    </div>
  );
};

/**
 * Abstract head used by the topical and graft scenes. Deliberately a diagram,
 * not an illustration of a person: an oval, a hair band on top that thins out,
 * and a donor band at the back.
 */
const Head: React.FC<{
  /** 0 = full hair on top, 1 = thinned out */
  thin?: number;
  donor?: number;
  children?: React.ReactNode;
}> = ({ thin = 0, donor = 0, children }) => (
  <svg width="620" height="600" viewBox="0 0 700 660">
    {/* shoulders, so the head is not floating */}
    <path
      d="M 170 660 C 190 560, 280 520, 350 520 C 420 520, 510 560, 530 660 Z"
      fill="rgba(255,255,255,0.05)"
      stroke="rgba(255,255,255,0.16)"
      strokeWidth="4"
    />
    <ellipse
      cx="350" cy="300" rx="196" ry="228"
      fill="rgba(255,255,255,0.075)"
      stroke="rgba(255,255,255,0.3)"
      strokeWidth="5"
    />
    {/* hair band across the top: each tuft thins with `thin` */}
    {Array.from({ length: 22 }).map((_, i) => {
      const t = i / 21;
      const angle = Math.PI * (1.06 - t * 1.12);
      const cx = 350 + Math.cos(angle) * 178;
      const cy = 300 - Math.sin(angle) * 210;
      const middle = 1 - Math.abs(t - 0.5) * 2;          // 1 at the crown
      const alpha = Math.max(0.1, 1 - thin * (0.4 + middle * 1.1));
      const r = 15 - thin * middle * 7;
      return (
        <circle key={`h${i}`} cx={cx} cy={cy} r={Math.max(4, r)} fill={theme.warm} opacity={alpha} />
      );
    })}
    {/* donor band at the back of the head */}
    {donor > 0 ? (
      <g opacity={donor}>
        <path
          d="M 168 366 C 150 420, 176 470, 214 492"
          fill="none"
          stroke={theme.paper}
          strokeWidth="5"
          strokeDasharray="4 10"
          opacity={0.6}
        />
        {Array.from({ length: 9 }).map((_, i) => (
          <circle
            key={`d${i}`}
            cx={172 + (i % 3) * 26}
            cy={392 + Math.floor(i / 3) * 30}
            r="10"
            fill={theme.paper}
          />
        ))}
        <text
          x="150" y="530" textAnchor="middle"
          fill="rgba(255,255,255,0.7)" fontFamily={SANS} fontWeight="600" fontSize="24"
        >
          zone donneuse
        </text>
      </g>
    ) : null}
    {children}
  </svg>
);

/* ------------------------------------------------------------------- scenes */

/** Opening: three numbered cards. */
export const IntroScene: React.FC = () => {
  const beat = useBeat();
  return (
    <SceneFrame>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 44 }}>
        <div style={{ display: "flex", gap: 28 }}>
          {["01", "02", "03"].map((n, i) => {
            // the hook card owns the first 2.2 s, so the cards land after it
            const p = beat(2.3 + i * 0.3);
            return (
              <div
                key={n}
                style={{
                  width: 210,
                  height: 210,
                  borderRadius: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  ...text(92, 700, i === 0 ? "#171310" : theme.paper),
                  background: i === 0 ? theme.warm : "rgba(255,255,255,0.07)",
                  border: `2px solid ${i === 0 ? theme.warm : "rgba(255,255,255,0.2)"}`,
                  transform: `translateY(${(1 - p) * 30}px) scale(${0.8 + p * 0.2})`,
                  opacity: p,
                }}
              >
                {n}
              </div>
            );
          })}
        </div>
        <div style={{ ...text(40, 600, "rgba(255,255,255,0.82)"), opacity: beat(3.4) }}>
          ce qui a fait ses preuves
        </div>
      </AbsoluteFill>
    </SceneFrame>
  );
};

/** "Le reste, c'est du marketing" — the promises get struck through. */
export const MarketingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = ["shampoing miracle", "gummies", "huiles magiques", "compléments"];

  return (
    <SceneFrame index="le reste">
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 26 }}>
        {items.map((item, i) => {
          const appear = spring({
            frame: frame - (4 + i * 5),
            fps,
            config: { damping: 20, stiffness: 130 },
          });
          const strike = interpolate(
            frame,
            [22 + i * 6, 34 + i * 6],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );
          return (
            <div
              key={item}
              style={{
                position: "relative",
                ...text(56, 600, `rgba(255,255,255,${0.9 - strike * 0.45})`),
                transform: `translateX(${(1 - appear) * -30}px)`,
                opacity: appear,
              }}
            >
              {item}
              <div
                style={{
                  position: "absolute",
                  left: -12,
                  right: -12,
                  top: "52%",
                  height: 5,
                  borderRadius: 999,
                  background: "#FF6B5A",
                  transform: `scaleX(${strike})`,
                  transformOrigin: "left center",
                }}
              />
            </div>
          );
        })}
      </AbsoluteFill>
    </SceneFrame>
  );
};

/** Solution 1: topical, applied on the scalp, only works while you keep at it. */
export const MinoxidilScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const beat = useBeat();
  const drop = beat(5.2);
  const bars = beat(9.1);
  const stop = interpolate(frame, [13.2 * fps, 14.4 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <SceneFrame index="solution 01" title="Minoxidil">
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingTop: 180 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
          <div style={{ position: "relative" }}>
            <Head thin={0.55 - bars * 0.25}>
              {/* drops falling onto the scalp */}
              {Array.from({ length: 5 }).map((_, i) => {
                const local = Math.max(0, drop - i * 0.12);
                return (
                  <circle
                    key={i}
                    cx={250 + i * 50}
                    cy={-10 + local * 105}
                    r="11"
                    fill={theme.warm}
                    opacity={local > 0 ? 0.9 * (1 - local * 0.25) : 0}
                  />
                );
              })}
            </Head>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { label: "chute", value: 0.34, tone: "#7ED9A7" },
              { label: "pousse", value: 0.66, tone: theme.warm },
            ].map((b, i) => (
              <div key={b.label} style={{ opacity: bars }}>
                <div style={text(28, 600, "rgba(255,255,255,0.7)")}>{b.label}</div>
                <div
                  style={{
                    width: 250,
                    height: 20,
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.1)",
                    marginTop: 8,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${b.value * 100 * bars}%`,
                      height: "100%",
                      background: b.tone,
                      transform: i === 0 ? "scaleX(1)" : undefined,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 46 }}>
          <Chips
            items={[
              { label: "lotion ou mousse", at: 2.6 },
              { label: "sur le cuir chevelu", at: 4.6, tone: "warm" },
            ]}
          />
        </div>

        <div
          style={{
            marginTop: 34,
            display: "flex",
            alignItems: "center",
            gap: 18,
            padding: "16px 28px",
            borderRadius: 22,
            border: `2px solid rgba(255,107,90,${stop})`,
            background: `rgba(255,107,90,${0.1 * stop})`,
            opacity: stop,
          }}
        >
          <span style={text(34, 700, "#FF6B5A")}>tu arrêtes</span>
          <span style={text(34, 600, "rgba(255,255,255,0.8)")}>→ l'effet s'arrête</span>
        </div>
      </AbsoluteFill>
    </SceneFrame>
  );
};

/** Solution 2: oral, on prescription, blocks DHT. */
export const FinasterideScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const beat = useBeat();
  const block = beat(9.5);
  const bars = beat(11.2);

  return (
    <SceneFrame index="solution 02" title="Finastéride">
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingTop: 200, gap: 34 }}>
        <Chips
          items={[
            { label: "traitement oral", at: 3.4 },
            { label: "sur ordonnance", at: 4.0, tone: "warm" },
          ]}
        />

        {/* DHT reaching the follicle, then blocked */}
        <svg width="760" height="240" viewBox="0 0 760 240">
          <g opacity={beat(8.6)}>
            <circle cx="120" cy="120" r="54" fill="rgba(255,107,90,0.16)" stroke="#FF6B5A" strokeWidth="4" />
            <text x="120" y="132" textAnchor="middle" fill="#FF6B5A" fontFamily={SANS} fontWeight="700" fontSize="34">
              DHT
            </text>
            <line
              x1="184" y1="120" x2={184 + 300 * beat(8.9)} y2="120"
              stroke="#FF6B5A" strokeWidth="6" strokeLinecap="round" strokeDasharray="14 12"
            />
            <circle cx="640" cy="120" r="46" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.35)" strokeWidth="4" />
            <text x="640" y="132" textAnchor="middle" fill="rgba(255,255,255,0.8)" fontFamily={SANS} fontWeight="600" fontSize="26">
              follicule
            </text>
          </g>
          {/* the block */}
          <g opacity={block} transform={`translate(430, 120) scale(${0.7 + block * 0.3})`}>
            <line x1="0" y1="-62" x2="0" y2="62" stroke={theme.warm} strokeWidth="10" strokeLinecap="round" />
            <circle cx="0" cy="0" r="26" fill="#0B0B0E" stroke={theme.warm} strokeWidth="6" />
          </g>
        </svg>

        <div style={{ display: "flex", gap: 34, opacity: bars }}>
          {[
            { label: "freine la chute", value: 0.82 },
            { label: "fait repousser", value: 0.34 },
          ].map((b) => (
            <div key={b.label} style={{ width: 300 }}>
              <div style={text(28, 600, "rgba(255,255,255,0.72)")}>{b.label}</div>
              <div
                style={{
                  height: 20,
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.1)",
                  marginTop: 8,
                  overflow: "hidden",
                }}
              >
                <div style={{ width: `${b.value * 100 * bars}%`, height: "100%", background: theme.warm }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ opacity: interpolate(frame, [13.6 * fps, 14.6 * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          <Chips
            items={[
              { label: "avis médical", at: 13.8, tone: "alert" },
              { label: "effets secondaires possibles", at: 14.4, tone: "alert" },
            ]}
            size={30}
          />
        </div>
      </AbsoluteFill>
    </SceneFrame>
  );
};

/** Solution 3: the graft — follicles move from the donor area to the top. */
export const GraftScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const beat = useBeat();
  const donor = beat(3.2);
  const travel = interpolate(frame, [5.3 * fps, 9 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <SceneFrame index="solution 03" title="La greffe">
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingTop: 190, gap: 30 }}>
        <Head thin={0.7 - travel * 0.55} donor={donor}>
          {Array.from({ length: 6 }).map((_, i) => {
            const local = Math.max(0, Math.min(1, travel * 1.4 - i * 0.1));
            const x = 190 + local * (120 + i * 26);
            const y = 400 - local * 300 - Math.sin(local * Math.PI) * 60;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="11"
                fill={local > 0.98 ? theme.warm : theme.paper}
                opacity={local > 0 ? 1 : 0}
              />
            );
          })}
        </Head>

        <Chips
          items={[
            { label: "zones sans repousse", at: 3.0 },
            { label: "définitif", at: 5.6, tone: "warm" },
          ]}
        />
        <div style={{ opacity: beat(9.2) }}>
          <Chips
            items={[
              { label: "intervention", at: 9.2, tone: "alert" },
              { label: "budget", at: 9.6, tone: "alert" },
              { label: "praticien sérieux", at: 13.2 },
            ]}
            size={30}
          />
        </div>
      </AbsoluteFill>
    </SceneFrame>
  );
};

/** The reminder: this is a medical decision, not a styling one. */
export const MedicalScene: React.FC = () => {
  const beat = useBeat();
  const card = beat(0.4);
  const split = beat(1.6);

  return (
    <SceneFrame index="rappel">
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 46 }}>
        <div
          style={{
            width: 150,
            height: 150,
            borderRadius: 44,
            border: `4px solid ${theme.warm}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            ...text(78, 700, theme.warm),
            transform: `scale(${0.8 + card * 0.2})`,
            opacity: card,
          }}
        >
          +
        </div>
        <div style={{ ...text(44, 700), textAlign: "center", maxWidth: 840, opacity: card }}>
          à évaluer avec un médecin ou un dermatologue
        </div>
        <div style={{ display: "flex", gap: 22, opacity: split }}>
          {[
            { who: "moi", what: "entretien & style", tone: theme.warm },
            { who: "le médecin", what: "le diagnostic", tone: "rgba(255,255,255,0.85)" },
          ].map((c, i) => (
            <div
              key={c.who}
              style={{
                width: 400,
                padding: "26px 24px",
                borderRadius: 26,
                background: "rgba(255,255,255,0.05)",
                border: "2px solid rgba(255,255,255,0.16)",
                textAlign: "center",
                transform: `translateY(${(1 - split) * 20}px) rotate(${(1 - split) * (i ? 1.5 : -1.5)}deg)`,
              }}
            >
              <div style={text(30, 700, c.tone)}>{c.who}</div>
              <div style={{ ...text(32, 600, "rgba(255,255,255,0.8)"), marginTop: 10 }}>
                {c.what}
              </div>
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </SceneFrame>
  );
};

/** CTA: the barber-chair clip, with the card animating over it. */
export const CtaScene: React.FC<{ title: string; line: string; chip: string }> = ({
  title,
  line,
  chip,
}) => {
  const frame = useCurrentFrame();
  const beat = useBeat();
  const card = beat(0.5);
  const sub = beat(1.1);
  const ring = (frame % 34) / 34;
  const nudge = Math.sin(frame / 6) * 7;

  return (
    <AbsoluteFill style={{ background: "#0B0B0E", overflow: "hidden" }}>
      <AbsoluteFill>
        <OffthreadVideo
          src={staticFile("cta-chair.mp4")}
          muted
          toneMapped={false}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(11,11,14,0.72) 0%, rgba(11,11,14,0.4) 45%, rgba(11,11,14,0.88) 100%)",
        }}
      />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 26 }}>
        <div
          style={{
            ...text(30, 700, theme.warm),
            letterSpacing: 3,
            textTransform: "uppercase",
            opacity: sub,
          }}
        >
          {chip}
        </div>
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div
            style={{
              position: "absolute",
              width: 460,
              height: 460,
              borderRadius: "50%",
              border: `3px solid ${theme.warm}`,
              transform: `scale(${0.55 + ring * 0.85})`,
              opacity: (1 - ring) * 0.4 * card,
            }}
          />
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: 18,
              padding: "26px 44px",
              borderRadius: 28,
              background: theme.paper,
              ...text(52, 700, "#141115"),
              boxShadow: "0 26px 70px rgba(0,0,0,0.5)",
              transform: `translateY(${(1 - card) * 32}px) scale(${0.9 + card * 0.1})`,
              opacity: card,
            }}
          >
            <span
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                background: theme.warm,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 30,
              }}
            >
              ✉
            </span>
            {title}
            <span style={{ transform: `translateX(${nudge}px)` }}>→</span>
          </div>
        </div>
        <div style={{ ...text(40, 600, "rgba(255,255,255,0.9)"), opacity: sub }}>{line}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
