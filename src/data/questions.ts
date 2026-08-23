/**
 * Copy and scenes for the questions reel (composition "Questions").
 *
 * One 1080×1920 take, camera mic properly recorded this time (−20.3 LUFS, 21 dB
 * of SNR). Auto-transcribed with whisper and cleaned by hand — the model heard
 * "la vitesse de 2 pouces" for "la vitesse de pousse", which is the one line
 * worth a proof-read.
 */

export type Phrase = { start: number; end: number; text: string };

export const phrases: Phrase[] = [
  { start: 0.00, end: 2.14, text: "Voici les pires questions à poser chez le barbier." },
  { start: 2.65, end: 4.52, text: "Est-ce que si je coupe mes cheveux, ils vont pousser plus vite ?" },
  { start: 5.00, end: 6.52, text: "La vitesse de pousse est génétique." },
  { start: 6.88, end: 9.08, text: "Donc même si tu coupes tous les jours, ça change rien du tout." },
  { start: 9.47, end: 12.76, text: "Le seul truc, c'est que ça évite la casse, donc ça donne l'impression que ça pousse mieux." },
  { start: 13.44, end: 15.22, text: "Pourquoi mes cheveux frisent d'un côté et pas de l'autre ?" },
  { start: 15.65, end: 18.64, text: "C'est tout à fait normal, le type de cheveux peut varier selon la zone du crâne." },
  { start: 18.90, end: 22.13, text: "C'est lié à la direction de croissance du follicule. Ce n'est donc pas un problème." },
  { start: 22.60, end: 26.75, text: "Dire « je veux exactement pareil que lui » en me montrant la photo de quelqu'un d'autre." },
  { start: 27.01, end: 29.84, text: "En fait chaque personne est différente, et donc chaque coupe" },
  { start: 30.10, end: 32.74, text: "par personne sera différente. Donc si tu aimes bien une coupe sur quelqu'un," },
  { start: 33.17, end: 35.14, text: "elle sera similaire mais pas exactement pareil." },
  { start: 35.53, end: 37.21, text: "Du coup la photo de base est une inspiration" },
  { start: 37.58, end: 41.60, text: "mais pas la garantie d'un résultat exactement identique. En vrai j'rigole, y'a aucune question bête." },
  { start: 42.16, end: 45.09, text: "Donc n'hésite jamais à demander. Si t'en as une, pose-la en commentaire." },
];

/** Words that take the warm accent colour. */
export const emphasis = [
  "pires",
  "vite",
  "génétique.",
  "rien",
  "casse,",
  "mieux.",
  "frisent",
  "normal,",
  "zone",
  "crâne.",
  "follicule.",
  "exactement",
  "pareil",
  "différente,",
  "différente.",
  "similaire",
  "inspiration",
  "garantie",
  "identique.",
  "bête.",
  "commentaire.",
];

export type Scene =
  | { kind: "ask"; index: string; question: string }
  | { kind: "genetics" }
  | { kind: "scalp" }
  | { kind: "unique" }
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
 * Three questions, each a card then an answer scene, and the CTA carries the
 * twist ("en vrai j'rigole, y'a aucune question bête"). Scenes are kept off
 * each other by at least 1.4 s of facecam: gaps shorter than that read as the
 * frame flickering rather than as a return to him.
 */
export const cues: Cue[] = [
  {
    at: 2.65,
    until: 5.00,
    scene: { kind: "ask", index: "question 01", question: "« ça pousse plus vite\nsi je coupe ? »" },
    sfx: "pop",
  },
  { at: 6.88, until: 11.30, scene: { kind: "genetics" }, sfx: "chime" },
  {
    at: 13.44,
    until: 15.60,
    scene: { kind: "ask", index: "question 02", question: "« pourquoi ça frise\nd'un seul côté ? »" },
    sfx: "swoosh",
  },
  { at: 17.40, until: 21.80, scene: { kind: "scalp" }, sfx: "marimba" },
  {
    at: 23.60,
    until: 27.05,
    scene: { kind: "ask", index: "question 03", question: "« je veux exactement\npareil que lui »" },
    sfx: "tick",
  },
  { at: 30.30, until: 34.60, scene: { kind: "unique" }, sfx: "pop" },
  { at: 39.40, until: 45.09, scene: { kind: "cta" }, sfx: "lift" },
];

export const hook = {
  big: "les pires questions",
  small: "que tu peux poser chez le barbier",
};
