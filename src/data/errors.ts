/**
 * Copy and scenes for the three-mistakes reel (composition "Errors").
 *
 * One 1080×1920 take. He barely pauses in this one — silencedetect finds four
 * segments over 31 s — so the phrases below come from a second pass at a 0.10 s
 * threshold, each sub-phrase transcribed on its own. Cleaned by hand: whisper
 * heard "te conserver" for "te concerner" and never once got "une coupe juste
 * parce qu'elle est tendance", which is the line worth a proof-read.
 */

export type Phrase = { start: number; end: number; text: string };

export const phrases: Phrase[] = [
  { start: 0.00, end: 1.83, text: "Il y a 3 erreurs que je vois quasiment" },
  { start: 1.95, end: 2.71, text: "à chaque rendez-vous." },
  { start: 3.15, end: 4.88, text: "La numéro 2 va sûrement te concerner." },
  { start: 5.39, end: 6.13, text: "Première erreur :" },
  { start: 6.23, end: 8.28, text: "attendre trop longtemps entre deux coupes." },
  { start: 8.69, end: 11.72, text: "Ça ne fait pas pousser plus vite, ça abîme juste la structure." },
  { start: 12.40, end: 15.03, text: "Deux : utiliser le même produit coiffant depuis 5 ans," },
  { start: 15.17, end: 17.92, text: "sans même savoir s'il est vraiment adapté à tes cheveux." },
  { start: 18.12, end: 20.94, text: "Trois, et c'est la plus fréquente : choisir une coupe juste parce qu'elle est" },
  { start: 21.05, end: 23.88, text: "tendance, sans savoir si elle correspond à la forme de ton visage." },
  { start: 24.33, end: 27.73, text: "Ces trois trucs à eux seuls, ça change complètement le rendu final d'une coupe." },
  { start: 28.34, end: 31.11, text: "Si tu veux éviter ces erreurs, ça commence par un vrai diagnostic." },
];

/** Words that take the warm accent colour. */
export const emphasis = [
  "3",
  "erreurs",
  "2",
  "longtemps",
  "coupes.",
  "vite,",
  "abîme",
  "structure.",
  "même",
  "5",
  "ans,",
  "adapté",
  "fréquente",
  "tendance,",
  "forme",
  "visage.",
  "rendu",
  "diagnostic.",
];

export type Scene =
  | { kind: "counter" }
  | { kind: "wait" }
  | { kind: "product" }
  | { kind: "trend" }
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
 * He lists the three without pausing between them, so the scenes cannot simply
 * follow his sentences — placed that way they would leave a third of a second
 * of facecam between items, which reads as a flicker. Each one starts a beat
 * into its item instead, which buys a real window back to him every time.
 */
export const cues: Cue[] = [
  { at: 3.15, until: 5.40, scene: { kind: "counter" }, sfx: "pop" },
  { at: 7.02, until: 11.60, scene: { kind: "wait" }, sfx: "chime" },
  { at: 13.85, until: 17.95, scene: { kind: "product" }, sfx: "swoosh" },
  { at: 19.72, until: 23.90, scene: { kind: "trend" }, sfx: "marimba" },
  { at: 28.34, until: 31.42, scene: { kind: "cta" }, sfx: "lift" },
];

/**
 * The hook is his own opening line — phrase 0, split on its own word timings:
 * "il y a" runs to frame 13, "3 erreurs" to 25, the rest to 70.
 */
export const hook = {
  first: "il y a",
  punch: "3 erreurs",
  rest: "que je vois à chaque rendez-vous",
};
