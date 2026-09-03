/**
 * Copy and scenes for the "no copy-paste" reel (composition "Copy").
 *
 * One 1080×1920 take. He runs long sentences together, so the phrases below
 * come from a second silence pass at a 0.10 s threshold with each sub-phrase
 * transcribed on its own. Cleaned by hand — two lines are worth a proof-read:
 * "quand un client me met une photo" (whisper heard "m'a mis") and "desservi
 * avec un autre type de morphologie" (it heard "desservir … de barfoule").
 */

/** The cue sounds live in one list, shared by every reel. */
import type { Sfx } from "../lib/sfx";

export type { Sfx };

export type Phrase = { start: number; end: number; text: string };

export const phrases: Phrase[] = [
  { start: 0.00, end: 2.35, text: "On me demande souvent la même coupe qu'un client a vue en photo." },
  { start: 2.70, end: 3.78, text: "Je dis presque toujours non." },
  { start: 4.24, end: 5.84, text: "Pourquoi je refuse de copier une coupe ?" },
  { start: 6.41, end: 7.69, text: "C'est pas parce que je veux compliquer les choses." },
  { start: 7.95, end: 11.25, text: "Parce que la même coupe sur deux visages différents ne donne jamais le même résultat." },
  { start: 11.42, end: 12.04, text: "Ce qui marche sur" },
  { start: 12.16, end: 15.11, text: "telle forme de visage peut être clairement desservi avec un autre type de morphologie." },
  { start: 15.23, end: 16.98, text: "Donc quand un client me met une photo," },
  { start: 17.17, end: 18.38, text: "je prends ce qu'il aime dans cette coupe :" },
  { start: 18.69, end: 20.78, text: "le style, l'esprit, et je l'adapte à lui." },
  { start: 21.10, end: 22.90, text: "Le résultat, c'est jamais du copier-coller." },
  { start: 23.49, end: 24.95, text: "Ce sera sa propre version à lui." },
  { start: 25.18, end: 28.75, text: "C'est ça la différence entre une coupe tendance et une coupe qui te va vraiment." },
];

/** Words that take the warm accent colour. */
export const emphasis = [
  "même",
  "non.",
  "refuse",
  "copier",
  "jamais",
  "résultat.",
  "forme",
  "desservi",
  "morphologie.",
  "style,",
  "l'esprit,",
  "l'adapte",
  "copier-coller.",
  "propre",
  "version",
  "tendance",
  "vraiment.",
];

export type Scene =
  | { kind: "refus" }
  | { kind: "twofaces" }
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
 * The camera sounds he added to the library carry this one: the reel is about a
 * client showing a photo, so a shutter on the refusal and a snap on the
 * side-by-side are the sound of the thing being talked about rather than a
 * generic cue.
 */
export const cues: Cue[] = [
  { at: 4.40, until: 6.80, scene: { kind: "refus" }, sfx: "shutter" },
  { at: 8.60, until: 11.30, scene: { kind: "twofaces" }, sfx: "snap" },
  { at: 12.75, until: 15.10, scene: { kind: "morpho" }, sfx: "chime" },
  { at: 17.30, until: 21.00, scene: { kind: "adapt" }, sfx: "sweep" },
  { at: 25.18, until: 28.86, scene: { kind: "cta" }, sfx: "lift" },
];

/**
 * The hook is his own opening line — phrase 0, split on its own word timings:
 * "on me demande souvent" runs to frame 23, "la même coupe" to 40, the rest
 * to 71.
 */
export const hook = {
  first: "on me demande souvent",
  punch: "la même coupe",
  rest: "qu'un client a vue en photo",
};
