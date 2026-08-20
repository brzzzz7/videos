/**
 * Copy and cues for the price reel (composition "Price").
 *
 * The picture arrived mute with the voice as a separate mp3, both 66.04 s and
 * already in sync — nothing is cut, so the phrases below are his speech
 * segments exactly as his own pauses delimit them. Auto-transcribed with
 * whisper and cleaned by hand; the one line worth a second look is the
 * "il continue à se former" phrase at 9.5 s, where the model kept hearing
 * "à ce moment on continue".
 */

export type Phrase = { start: number; end: number; text: string };

export const phrases: Phrase[] = [
  { start: 0.81, end: 4.37, text: "Tu trouves que 35 € pour une coupe c'est cher ? Attends de voir ce que ça couvre vraiment." },
  { start: 4.88, end: 5.90, text: "D'abord, il y a la formation." },
  { start: 6.88, end: 9.25, text: "Un barbier sérieux, c'est des années à apprendre des techniques." },
  { start: 9.54, end: 13.20, text: "Et il continue à se former sur les nouvelles coupes et produits. Ce que tu payes, c'est aussi un savoir-faire." },
  { start: 13.56, end: 14.90, text: "Pas juste 20 minutes de ciseaux." },
  { start: 15.93, end: 17.30, text: "Ensuite, il y a le matériel." },
  { start: 17.55, end: 21.29, text: "Une bonne tondeuse professionnelle, ça coûte largement plus cher qu'une tondeuse en supermarché." },
  { start: 21.89, end: 22.44, text: "Et ça s'use," },
  { start: 22.77, end: 24.23, text: "ça se remplace, ça se répare." },
  { start: 24.67, end: 28.96, text: "Sans parler des produits utilisés pendant la coupe : c'est pas les mêmes que ceux à 5 € en grande surface." },
  { start: 29.32, end: 30.75, text: "Il y a aussi le temps qu'on te consacre." },
  { start: 30.80, end: 32.54, text: "Un bon dégradé, ça se bâcle pas en 10 minutes." },
  { start: 33.35, end: 37.65, text: "Plus on prend le temps de bien faire les finitions, plus le résultat tient et te va bien pendant longtemps." },
  { start: 38.34, end: 40.96, text: "Ce qui, au final, te fait économiser en fréquence de coupe." },
  { start: 41.26, end: 42.31, text: "Et les loyers," },
  { start: 42.81, end: 43.37, text: "les charges," },
  { start: 43.96, end: 45.93, text: "tout ce qu'on voit pas. Un salon, c'est un loyer," },
  { start: 46.51, end: 47.77, text: "y'a de l'électricité à payer," },
  { start: 48.02, end: 50.35, text: "les assurances aussi, avant même de commencer à te couper." },
  { start: 50.93, end: 52.46, text: "Un salon low cost qui casse les prix," },
  { start: 52.78, end: 54.61, text: "c'est souvent qu'il t'enlève un de ces points :" },
  { start: 56.41, end: 59.30, text: "la formation, le matériel ou le temps passé sur toi." },
  { start: 59.88, end: 66.04, text: "La prochaine fois que t'hésites entre un salon pas cher et un vrai pro, pense à tout ce que ça couvre. Viens voir la différence, prends rendez-vous." },
];

/** Words that take the warm accent colour. */
export const emphasis = [
  "35",
  "€",
  "vraiment",
  "formation",
  "années",
  "savoir-faire",
  "matériel",
  "professionnelle",
  "supermarché",
  "s'use",
  "répare",
  "produits",
  "5",
  "temps",
  "dégradé",
  "finitions",
  "longtemps",
  "économiser",
  "loyers",
  "charges",
  "électricité",
  "assurances",
  "low",
  "cost",
  "pro",
  "rendez-vous",
];

export type Illo =
  | { kind: "tag" }
  | { kind: "formation" }
  | { kind: "material" }
  | { kind: "products" }
  | { kind: "time" }
  | { kind: "saving" }
  | { kind: "charges" }
  | { kind: "lowcost" }
  | { kind: "cta" };

export type Sfx = "pop" | "tick" | "chime" | "swoosh" | "marimba" | "lift";

export type Cue = {
  /** source seconds */
  at: number;
  until: number;
  illo: Illo;
  /** light sound played as the panel changes — never the same as the cue before */
  sfx: Sfx;
};

/**
 * Unlike the other split reel, the panels here are contiguous: the whole script
 * is one enumeration — training, kit, products, time, overheads — so the top
 * half is a running breakdown rather than an occasional aside. The split opens
 * once, at 0.8 s, and the panels cross-fade inside it. Leaving gaps made the
 * frame bounce open and shut on every item, which is the note he gave on the
 * previous cut.
 */
export const cues: Cue[] = [
  { at: 0.8, until: 4.7, illo: { kind: "tag" }, sfx: "pop" },
  { at: 4.7, until: 15.6, illo: { kind: "formation" }, sfx: "chime" },
  { at: 15.6, until: 24.5, illo: { kind: "material" }, sfx: "swoosh" },
  { at: 24.5, until: 29.2, illo: { kind: "products" }, sfx: "marimba" },
  { at: 29.2, until: 38.1, illo: { kind: "time" }, sfx: "tick" },
  { at: 38.1, until: 41.1, illo: { kind: "saving" }, sfx: "pop" },
  { at: 41.1, until: 50.7, illo: { kind: "charges" }, sfx: "chime" },
  { at: 50.7, until: 59.6, illo: { kind: "lowcost" }, sfx: "swoosh" },
  { at: 59.6, until: 66.04, illo: { kind: "cta" }, sfx: "lift" },
];

export const hook = {
  big: "35 € la coupe",
  small: "c'est cher ? voilà ce que tu payes vraiment",
};
