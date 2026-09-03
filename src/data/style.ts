/**
 * Copy and scenes for the trending-cut reel (composition "Style").
 *
 * One 1080×1920 take with the camera mic ~27 dB down, plus a screen recording
 * he sent of the cut he is talking about. Auto-transcribed with whisper and
 * cleaned by hand.
 */

/** The cue sounds live in one list, shared by every reel. */
import type { Sfx } from "../lib/sfx";

export type { Sfx };

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

export type Cue = {
  /** source seconds */
  at: number;
  until: number;
  scene: Scene;
  /** light sound as the scene takes over — never the same as the cue before */
  sfx: Sfx;
};

/**
 * Five scenes over twenty seconds, the first of them the clip he sent: it lands
 * on "cette coupe est partout", which is the one moment in the reel where
 * showing the actual cut beats drawing anything.
 */
export const cues: Cue[] = [
  { at: 2.20, until: 4.50, scene: { kind: "broll" }, sfx: "swoosh" },
  { at: 6.35, until: 8.05, scene: { kind: "styling" }, sfx: "pop" },
  { at: 10.10, until: 16.20, scene: { kind: "morpho" }, sfx: "chime" },
  { at: 18.90, until: 21.00, scene: { kind: "adapt" }, sfx: "marimba" },
  { at: 23.20, until: 25.79, scene: { kind: "cta" }, sfx: "lift" },
];

/**
 * The hook is his own opening line — phrase 0, split on its own word timings:
 * "cette coupe" runs to frame 15, "est partout en ce moment" to 40, and the
 * question to 87. The last part is trimmed to fit the frame ("mais faite pour
 * tout le monde ?" for "mais est-ce qu'elle est vraiment faite pour tout le
 * monde ?"); the caption underneath carries it in full.
 */
export const hook = {
  first: "cette coupe",
  punch: "est partout en ce moment",
  rest: "mais faite pour tout le monde ?",
};
