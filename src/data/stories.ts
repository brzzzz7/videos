/**
 * Copy and scenes for the client-stories reel (composition "Stories").
 *
 * A single 1080×1920 take with the camera mic 27 dB down. Auto-transcribed with
 * whisper and cleaned by hand — the model heard "un clé en magie" for "un client
 * m'a dit" and "la tente" for "l'attente" (homophones), both worth a proof-read.
 */

export type Phrase = { start: number; end: number; text: string };

export const phrases: Phrase[] = [
  { start: 0.00, end: 2.48, text: "J'ai demandé à mes clients leurs pires souvenirs chez un barbier," },
  { start: 2.80, end: 4.17, text: "et certaines réponses m'ont fait halluciner." },
  { start: 4.61, end: 8.67, text: "Premier témoignage : le mec qui voulait une coupe juste un peu plus courte et qui est revenu complètement rasé." },
  { start: 9.00, end: 11.34, text: "Un client m'a raconté qu'il avait demandé 2 cm de moins" },
  { start: 11.60, end: 13.54, text: "et qu'il est reparti avec une coupe 3 fois trop courte." },
  { start: 13.85, end: 17.54, text: "Ça, c'est le classique du malentendu entre ce que l'on dit et ce que l'on montre." },
  { start: 17.82, end: 20.70, text: "Deuxième témoignage : l'attente de deux heures pour un rendez-vous pris." },
  { start: 21.47, end: 23.63, text: "Certains ont vécu des salons hyper mal organisés," },
  { start: 24.00, end: 27.08, text: "où même avec un rendez-vous fixé, l'attente était interminable." },
  { start: 27.78, end: 30.09, text: "Ça montre l'importance du respect du temps client." },
  { start: 30.98, end: 33.74, text: "Troisième témoignage : le barbier qui n'écoute rien du tout." },
  { start: 34.18, end: 37.62, text: "Un client m'a dit qu'il essayait d'expliquer ce qu'il voulait, mais que le barbier" },
  { start: 37.89, end: 38.96, text: "voulait faire sa version à lui." },
  { start: 39.48, end: 44.72, text: "Bien entendu, sans tenir compte de la demande. Ça, c'est avec certitude une frustration garantie des deux côtés." },
  { start: 45.23, end: 47.28, text: "Si toi aussi t'as déjà vécu une horreur chez un barbier," },
  { start: 47.61, end: 49.60, text: "raconte-le nous en commentaire, on veut tout savoir." },
];

/** Words that take the warm accent colour. */
export const emphasis = [
  "pires",
  "halluciner",
  "rasé",
  "2",
  "cm",
  "3",
  "courte.",
  "malentendu",
  "dit",
  "montre.",
  "attente",
  "l'attente",
  "heures",
  "interminable.",
  "temps",
  "n'écoute",
  "rien",
  "version",
  "frustration",
  "horreur",
  "commentaire,",
];

export type Scene =
  | { kind: "shaved" }
  | { kind: "numbers" }
  | { kind: "clock" }
  | { kind: "appointment" }
  | { kind: "deaf" }
  | { kind: "bubbles" }
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
 * The visuals take the whole screen this time, so they alternate with the
 * facecam instead of sitting above it: each testimony gets a scene on its
 * headline and another on its punchline, and he comes back in between to
 * deliver the lesson. Roughly half the reel is scene, half is face — a
 * full-screen graphic that never gives the frame back stops being an
 * illustration and becomes the video.
 */
export const cues: Cue[] = [
  { at: 4.61, until: 9.00, scene: { kind: "shaved" }, sfx: "pop" },
  { at: 11.30, until: 13.85, scene: { kind: "numbers" }, sfx: "chime" },
  { at: 17.82, until: 21.47, scene: { kind: "clock" }, sfx: "swoosh" },
  { at: 24.00, until: 27.78, scene: { kind: "appointment" }, sfx: "marimba" },
  { at: 30.98, until: 34.18, scene: { kind: "deaf" }, sfx: "tick" },
  { at: 37.89, until: 41.10, scene: { kind: "bubbles" }, sfx: "pop" },
  { at: 45.23, until: 49.60, scene: { kind: "cta" }, sfx: "lift" },
];

export const hook = {
  big: "3 horreurs vécues",
  small: "chez le barbier — racontées par mes clients",
};
