/**
 * Copy, scenes and cue sounds for the hair-loss reel (composition "Solutions").
 *
 * This one arrived as a voice recording with no camera, so there is no facecam
 * to fall back on: the scenes carry the whole frame, back to back, and the only
 * footage is the barber-chair clip on the CTA.
 *
 * Transcribed automatically then cleaned by hand — the model heard "minoxygil",
 * "la Diashti" and "la grève des cheveux" for minoxidil, DHT and la greffe.
 */

export type Phrase = { start: number; end: number; text: string };

export const phrases: Phrase[] = [
  { start: 3.68, end: 4.66, text: "Si tu perds tes cheveux," },
  { start: 4.91, end: 7.43, text: "voici les 3 seules solutions qui ont vraiment fait leurs preuves." },
  { start: 8.04, end: 9.57, text: "Le reste, c'est du marketing." },
  { start: 11.53, end: 12.43, text: "Solution numéro 1 :" },
  { start: 12.88, end: 13.68, text: "le minoxidil." },
  { start: 14.33, end: 16.33, text: "C'est le traitement le plus connu et le plus accessible," },
  { start: 16.62, end: 19.63, text: "en lotion ou mousse, à appliquer directement sur le cuir chevelu." },
  { start: 20.43, end: 23.68, text: "Il ralentit la chute et peut relancer la pousse sur certaines zones," },
  { start: 24.21, end: 24.98, text: "mais il faut être régulier :" },
  { start: 25.46, end: 27.38, text: "l'effet s'arrête si tu arrêtes le traitement." },
  { start: 29.72, end: 30.71, text: "Solution numéro 2 :" },
  { start: 31.08, end: 32.05, text: "le finastéride." },
  { start: 32.94, end: 38.45, text: "C'est un traitement oral sur ordonnance, qui agit sur l'hormone responsable de la calvitie génétique :" },
  { start: 39.03, end: 39.58, text: "la DHT." },
  { start: 40.47, end: 42.94, text: "Plus efficace pour freiner la chute que pour faire repousser," },
  { start: 43.36, end: 45.93, text: "mais ça nécessite un avis médical avant de se lancer." },
  { start: 46.54, end: 48.35, text: "Il y a des effets secondaires possibles à connaître." },
  { start: 50.15, end: 52.36, text: "Solution numéro 3 : la greffe de cheveux." },
  { start: 53.09, end: 54.85, text: "Pour les zones où il n'y a plus de repousse," },
  { start: 55.14, end: 57.91, text: "c'est la seule solution vraiment définitive." },
  { start: 58.96, end: 59.67, text: "Plus lourd niveau" },
  { start: 60.56, end: 63.57, text: "intervention et budget, mais les résultats sont durables" },
  { start: 63.84, end: 64.84, text: "si c'est bien fait" },
  { start: 65.24, end: 66.43, text: "par un praticien sérieux." },
  { start: 67.41, end: 68.44, text: "Petit rappel important :" },
  { start: 68.72, end: 73.57, text: "ces solutions doivent être évaluées avec un médecin ou un dermatologue, selon le type de calvitie." },
  { start: 74.38, end: 78.78, text: "Je peux te conseiller sur l'entretien et le style, mais pas remplacer un diagnostic médical." },
  { start: 81.23, end: 83.47, text: "Si tu veux qu'on regarde ensemble où t'en es" },
  { start: 83.79, end: 86.39, text: "et ce qui pourrait t'aider : viens en DM ou prends rendez-vous." },
];

/** Words that take the warm accent colour. */
export const emphasis = [
  "3",
  "marketing.",
  "minoxidil.",
  "cuir",
  "chevelu.",
  "régulier",
  "finastéride.",
  "ordonnance,",
  "DHT.",
  "médical",
  "secondaires",
  "greffe",
  "définitive.",
  "durables",
  "médecin",
  "dermatologue,",
  "DM",
  "rendez-vous.",
];

export type Scene =
  | { kind: "intro" }
  | { kind: "marketing" }
  | { kind: "minoxidil" }
  | { kind: "finasteride" }
  | { kind: "graft" }
  | { kind: "medical" }
  | { kind: "cta" };

export type Sfx = "pop" | "tick" | "chime" | "swoosh" | "marimba" | "lift";

/** Scene boundaries in source seconds; each one fills the frame. */
export const scenes: { at: number; scene: Scene; sfx: Sfx }[] = [
  { at: 3.4, scene: { kind: "intro" }, sfx: "pop" },
  { at: 7.9, scene: { kind: "marketing" }, sfx: "swoosh" },
  { at: 11.3, scene: { kind: "minoxidil" }, sfx: "chime" },
  { at: 29.4, scene: { kind: "finasteride" }, sfx: "marimba" },
  { at: 49.8, scene: { kind: "graft" }, sfx: "tick" },
  { at: 67.1, scene: { kind: "medical" }, sfx: "pop" },
  { at: 80.4, scene: { kind: "cta" }, sfx: "lift" },
];

/**
 * Extra accents inside the long scenes, on the beat where a new element lands.
 * Source seconds; the no-repeat rule is checked across scenes and accents
 * together in src/solutions.ts.
 */
export const accents: { at: number; sfx: Sfx }[] = [
  { at: 16.5, sfx: "tick" },      // application on the scalp
  { at: 24.1, sfx: "pop" },       // "il faut être régulier"
  { at: 32.8, sfx: "tick" },      // oral, on prescription
  { at: 38.9, sfx: "swoosh" },    // DHT blocked
  { at: 43.3, sfx: "marimba" },   // medical advice
  { at: 53.0, sfx: "chime" },     // donor zone
  { at: 58.8, sfx: "swoosh" },    // heavier: budget
  { at: 68.6, sfx: "marimba" },   // the reminder card
];

export const hook = {
  big: "3 solutions",
  small: "qui marchent vraiment contre la perte de cheveux",
};

export const cta = {
  title: "Viens en DM",
  line: "ou prends rendez-vous",
  chip: "on regarde où tu en es",
};
