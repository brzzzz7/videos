/**
 * Copy and scenes for the trending-cut reel (composition "Style").
 *
 * One 1080×1920 take with the camera mic ~27 dB down, plus a screen recording
 * he sent of the cut he is talking about. Auto-transcribed with whisper and
 * cleaned by hand.
 */

export type Phrase = { start: number; end: number; text: string };

export const phrases: Phrase[] = [
  { start: 1.41, end: 4.45, text: "Cette coupe est partout en ce moment, mais est-ce qu'elle est vraiment faite pour tout le monde ?" },
  { start: 4.65, end: 6.25, text: "Alors clairement, elle a un gros avantage :" },
  { start: 6.57, end: 7.68, text: "c'est qu'il n'y a même pas besoin de la coiffer." },
  { start: 7.95, end: 9.22, text: "Mais elle a une limite qu'on ne dit jamais." },
  { start: 9.87, end: 12.05, text: "Elle demande un visage assez fin et allongé." },
  { start: 12.55, end: 16.05, text: "Sur un visage plutôt rond par exemple, ça aura tendance à un peu grossir la personne." },
  { start: 16.48, end: 19.15, text: "Avant de l'imposer à un client, je regarde d'abord sa morphologie." },
  { start: 19.49, end: 22.18, text: "Et souvent on l'adapte, plutôt que de faire la copie identique." },
  { start: 22.65, end: 24.87, text: "Si tu veux savoir si elle te va, viens nous en discuter." },
  { start: 25.23, end: 25.79, text: "Rendez-vous !" },
];

/** Words that take the warm accent colour. */
export const emphasis = [
  "partout",
  "avantage",
  "coiffer.",
  "limite",
  "jamais.",
  "fin",
  "allongé.",
  "rond",
  "grossir",
  "morphologie.",
  "adapte,",
  "copie",
  "identique.",
  "discuter.",
  "rendez-vous",
];

export type Scene =
  | { kind: "broll" }
  | { kind: "styling" }
  | { kind: "morpho" }
  | { kind: "adapt" }
  | { kind: "cta" };

export type Sfx = "pop" | "tick" | "chime" | "swoosh" | "marimba" | "lift";

export type Cue = {
  /** source seconds */
  at: number;
  until: number;
  scene: Scene;
  /** light sound as the scene takes over — never the same as the cue before */
  sfx: Sfx;
};

/**
 * Five scenes over eighteen seconds, the first of them the clip he sent: it
 * lands on "cette coupe est partout", which is the one moment in the reel where
 * showing the actual cut beats drawing anything.
 *
 * At this length every cue is within a few frames of the minimum facecam gap,
 * so these numbers are the result of solving against the cut rather than round
 * choices — moving one by a tenth of a second moves the next two.
 */
export const cues: Cue[] = [
  { at: 2.20, until: 4.05, scene: { kind: "broll" }, sfx: "swoosh" },
  { at: 6.67, until: 8.30, scene: { kind: "styling" }, sfx: "pop" },
  { at: 10.60, until: 16.20, scene: { kind: "morpho" }, sfx: "chime" },
  { at: 18.90, until: 21.00, scene: { kind: "adapt" }, sfx: "marimba" },
  { at: 23.20, until: 25.79, scene: { kind: "cta" }, sfx: "lift" },
];

/**
 * The hook is his own opening line — phrase 0, split on its own word timings:
 * "cette coupe" runs to frame 12, "est partout en ce moment" to 35, and the
 * question to 68. The last part is trimmed to fit the frame ("mais faite pour
 * tout le monde ?" for "mais est-ce qu'elle est vraiment faite pour tout le
 * monde ?"); the caption underneath carries it in full.
 */
export const hook = {
  first: "cette coupe",
  punch: "est partout en ce moment",
  rest: "mais faite pour tout le monde ?",
};
