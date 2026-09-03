/**
 * Copy and scenes for the "what barbers don't tell you" reel (composition
 * "Secrets").
 *
 * One 1080×1920 take. He barely pauses, so the phrases come from a second
 * silence pass at a 0.10 s threshold with each sub-phrase transcribed on its
 * own. Cleaned by hand — whisper heard "les barbares" for "les barbiers"
 * throughout, and "hein" for the "un" that numbers the first point.
 */

/** The cue sounds live in one list, shared by every reel. */
import type { Sfx } from "../lib/sfx";

export type { Sfx };

export type Phrase = { start: number; end: number; text: string };

export const phrases: Phrase[] = [
  { start: 0.00, end: 3.01, text: "Il y a des trucs que les barbiers ne te disent jamais au rendez-vous. Je vais t'en casser 3." },
  { start: 3.40, end: 4.25, text: "Un : quand tu demandes" },
  { start: 4.47, end: 6.10, text: "« ça me va bien ? » juste après la coupe," },
  { start: 6.26, end: 8.92, text: "la réponse est presque toujours oui, même quand c'est pas totalement le cas." },
  { start: 9.22, end: 11.36, text: "Personne n'a envie de te dire non, les ciseaux encore en main." },
  { start: 11.80, end: 14.21, text: "Deux : la coupe qui a l'air parfaite en sortant du salon," },
  { start: 14.60, end: 17.90, text: "c'est parce qu'on vient de la coiffer avec des produits et un sèche-cheveux professionnel." },
  { start: 18.28, end: 20.58, text: "Le vrai test, c'est comment elle tient le lendemain matin," },
  { start: 20.86, end: 22.82, text: "toute seule. Trois : si un coiffeur te dit" },
  { start: 23.10, end: 24.41, text: "« cette coupe elle va à tout le monde »," },
  { start: 24.59, end: 26.52, text: "méfie-toi : aucune coupe ne va à tout le monde." },
  { start: 26.81, end: 28.94, text: "Ça dépend de la forme de ton visage, point final." },
  { start: 29.17, end: 30.39, text: "Moi je préfère te dire la vérité," },
  { start: 30.72, end: 32.68, text: "même si ça prend 2 minutes de plus en diagnostic." },
];

/** Words that take the warm accent colour. */
export const emphasis = [
  "jamais",
  "3.",
  "oui,",
  "cas.",
  "non,",
  "ciseaux",
  "parfaite",
  "produits",
  "sèche-cheveux",
  "professionnel.",
  "vrai",
  "test,",
  "lendemain",
  "seule.",
  "méfie-toi",
  "aucune",
  "forme",
  "visage,",
  "vérité,",
  "diagnostic.",
];

export type Scene =
  | { kind: "yes" }
  | { kind: "salon" }
  | { kind: "morning" }
  | { kind: "everyone" }
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
 * He runs the three points together with almost no pause, so as on the other
 * list reels each scene starts a beat into its item rather than on its first
 * word — that is what buys a real window back to camera between them.
 */
export const cues: Cue[] = [
  { at: 4.60, until: 8.90, scene: { kind: "yes" }, sfx: "pop" },
  { at: 12.10, until: 17.90, scene: { kind: "salon" }, sfx: "sweep" },
  { at: 19.70, until: 22.80, scene: { kind: "morning" }, sfx: "tick" },
  { at: 24.75, until: 28.60, scene: { kind: "everyone" }, sfx: "snap" },
  { at: 30.65, until: 33.18, scene: { kind: "cta" }, sfx: "lift" },
];

/**
 * The hook is his own opening line — phrase 0, split on its own word timings so
 * the setup lands first and the payoff takes the marker: "il y a des trucs que
 * les barbiers" runs to frame 32, "ne te disent jamais" to 52, "au rendez-vous"
 * to 67.
 */
export const hook = {
  first: "il y a des trucs que les barbiers",
  punch: "ne te disent jamais",
  rest: "au rendez-vous",
};
