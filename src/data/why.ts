/**
 * Copy and scenes for the visagisme-origin reel (composition "Why").
 *
 * One 1080×1920 take, and the longest script so far. He barely pauses, so the
 * phrases come from a second silence pass at a 0.10 s threshold with each
 * sub-phrase transcribed on its own. Cleaned by hand — whisper heard "le
 * technique" for "le déclic", "ça me fousserait" for "ça me frustrait" and
 * "je ne fais plus l'usine coupe" for "je ne fais plus une coupe".
 */

/** The cue sounds live in one list, shared by every reel. */
import type { Sfx } from "../lib/sfx";

export type { Sfx };

export type Phrase = { start: number; end: number; text: string };

export const phrases: Phrase[] = [
  { start: 0.25, end: 3.02, text: "On me demande souvent pourquoi je fais du visagisme plutôt que juste des coupes" },
  { start: 3.14, end: 3.79, text: "classiques." },
  { start: 4.03, end: 4.75, text: "Je vais vous expliquer." },
  { start: 5.64, end: 7.15, text: "Au début, je faisais des coupes comme tout le monde :" },
  { start: 7.76, end: 9.78, text: "le client montre une photo, tu la reproduis, point." },
  { start: 10.54, end: 14.03, text: "Mais je voyais des résultats qui ne collaient jamais vraiment avec la personne que j'avais en face de moi." },
  { start: 14.46, end: 17.92, text: "La même coupe sur deux visages différents, ça donnait deux résultats complètement différents." },
  { start: 18.57, end: 22.20, text: "Et ça me frustrait de voir des clients repartir avec une coupe à la mode mais qui ne les mettait pas en valeur." },
  { start: 22.82, end: 24.78, text: "Le déclic, ça a été de me former sur la morphologie," },
  { start: 24.92, end: 25.56, text: "pour comprendre pourquoi" },
  { start: 25.69, end: 27.91, text: "telle ligne fonctionne sur tel visage et pas sur un autre." },
  { start: 28.23, end: 30.37, text: "Depuis, je ne fais plus une coupe sans passer par un vrai diagnostic." },
  { start: 31.15, end: 33.07, text: "Ça prend plus de temps, mais le résultat n'a rien à voir." },
  { start: 33.40, end: 35.97, text: "C'est pour ça que chez moi, ça commence toujours par la même question :" },
  { start: 36.07, end: 37.23, text: "c'est quoi ton visage ?" },
  { start: 37.58, end: 39.07, text: "Et pas c'est quoi la tendance." },
];

/** Words that take the warm accent colour. */
export const emphasis = [
  "visagisme",
  "classiques.",
  "photo,",
  "reproduis,",
  "point.",
  "collaient",
  "jamais",
  "différents,",
  "différents.",
  "frustrait",
  "mode",
  "valeur.",
  "déclic,",
  "morphologie,",
  "ligne",
  "visage",
  "diagnostic.",
  "temps,",
  "question",
  "visage",
  "tendance.",
];

export type Scene =
  | { kind: "photo" }
  | { kind: "twofaces" }
  | { kind: "trend" }
  | { kind: "declic" }
  | { kind: "diag" }
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
 * Six scenes, each starting a beat into its point rather than on its first
 * word: he speaks without pausing, so placed on his sentence boundaries four of
 * these six left under a second of facecam between them.
 *
 * Each one now leaves a little before its sentence does. At RATE 1.05 the gaps
 * between them shrink with everything else, and four of the five were within a
 * frame or two of the 42-frame floor that keeps a return to camera from reading
 * as a flicker — so the scenes give the frames back rather than the guard being
 * lowered to fit them.
 */
export const cues: Cue[] = [
  { at: 8.10, until: 10.00, scene: { kind: "photo" }, sfx: "shutter" },
  { at: 15.00, until: 17.85, scene: { kind: "twofaces" }, sfx: "chime" },
  { at: 20.05, until: 22.08, scene: { kind: "trend" }, sfx: "snap" },
  { at: 24.20, until: 27.92, scene: { kind: "declic" }, sfx: "sweep" },
  { at: 29.70, until: 33.01, scene: { kind: "diag" }, sfx: "pop" },
  { at: 34.90, until: 39.07, scene: { kind: "cta" }, sfx: "lift" },
];

/**
 * The hook is his own opening line — phrase 0, split so the word that names the
 * subject takes the marker: "on me demande souvent pourquoi je fais" runs to
 * frame 46, "du visagisme" to 63, the rest to 91.
 */
export const hook = {
  first: "on me demande souvent pourquoi je fais",
  punch: "du visagisme",
  rest: "plutôt que des coupes classiques",
};
