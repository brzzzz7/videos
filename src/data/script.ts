/**
 * Transcript of talk.mp4, anchored to the source timeline (seconds).
 *
 * Auto-transcribed (whisper) then cleaned by hand. Each entry is a phrase
 * delimited by a real pause in the audio, so word timings only ever drift
 * inside a phrase. Edit the text here and the subtitles follow.
 */

export type Phrase = {
  start: number;
  end: number;
  text: string;
};

export const phrases: Phrase[] = [
  { start: 0.51, end: 4.38, text: "Quand un client s'assoit dans mon fauteuil, je sais en deux secondes s'il prend soin de ses cheveux ou pas." },
  { start: 4.74, end: 5.4, text: "Je t'explique comment." },
  { start: 5.58, end: 6.62, text: "Premier truc que je regarde :" },
  { start: 6.86, end: 7.8, text: "l'état du cuir chevelu." },
  { start: 7.98, end: 9.82, text: "Si c'est sec, avec des pellicules" },
  { start: 10.02, end: 10.67, text: "ou irrité," },
  { start: 10.82, end: 12.27, text: "9 fois sur 10 c'est un shampoing trop" },
  { start: 12.61, end: 14.1, text: "fréquent ou un produit pas adapté." },
  { start: 14.29, end: 15.2, text: "Deuxième chose :" },
  { start: 15.44, end: 16.81, text: "la repousse et l'épaisseur près de la nuque." },
  { start: 17.46, end: 20.27, text: "Ça me dit tout de suite depuis combien de temps la personne n'est pas passée chez un coiffeur." },
  { start: 20.57, end: 23.3, text: "Et souvent, plus c'est long, plus la coupe a perdu sa forme d'origine." },
  { start: 23.71, end: 24.43, text: "Troisième signe :" },
  { start: 24.67, end: 26.41, text: "la façon dont les cheveux tombent naturellement." },
  { start: 26.63, end: 28.77, text: "Est-ce qu'ils sont disciplinés ou est-ce qu'ils partent dans tous les sens ?" },
  { start: 29.03, end: 31.13, text: "Ça m'indique tout de suite si la personne utilise un produit" },
  { start: 31.29, end: 33.67, text: "au quotidien ou si elle laisse juste ses cheveux à l'air libre en espérant" },
  { start: 34.03, end: 34.94, text: "que ça se tienne tout seul." },
  { start: 35.39, end: 36.08, text: "Dernier détail :" },
  { start: 36.24, end: 37.28, text: "la texture au toucher." },
  { start: 38.22, end: 39.37, text: "Cheveux secs et cassants," },
  { start: 39.78, end: 40.28, text: "c'est trop de chaleur," },
  { start: 40.67, end: 41.51, text: "pas assez d'hydratation." },
  { start: 41.91, end: 42.93, text: "Cheveux gras et lourds," },
  { start: 43.37, end: 45.35, text: "c'est un shampoing pas assez fréquent ou un mauvais produit." },
  { start: 45.86, end: 47.64, text: "Si tu veux savoir ce que je remarquerais chez toi," },
  { start: 47.99, end: 49.48, text: "viens en DM ou prends rendez-vous," },
  { start: 49.85, end: 50.85, text: "je te fais un diagnostic complet." },
];

/** Words that get the accent colour when they land. */
export const emphasis = [
  "deux",
  "secondes",
  "cuir",
  "chevelu",
  "pellicules",
  "irrité",
  "shampoing",
  "repousse",
  "épaisseur",
  "nuque",
  "coiffeur",
  "forme",
  "d'origine",
  "disciplinés",
  "sens",
  "quotidien",
  "texture",
  "toucher",
  "secs",
  "cassants",
  "chaleur",
  "hydratation",
  "gras",
  "lourds",
  "fréquent",
  "diagnostic",
  "complet",
  "DM",
  "rendez-vous",
];

/** Chapter cards, keyed to the moment he announces each point. */
export const chapters = [
  { at: 5.58, index: "01", label: "Le cuir chevelu" },
  { at: 14.29, index: "02", label: "La repousse" },
  { at: 23.71, index: "03", label: "La tombée" },
  { at: 35.39, index: "04", label: "La texture" },
];

/** Where we cut away from the talking head to the barbershop b-roll. */
export const CTA_SOURCE_START = 45.86;

export const hook = {
  lines: ["En 2 secondes", "je sais tout", "sur tes cheveux"],
  kicker: "Diagnostic capillaire",
};

export const cta = {
  title: "Prends ton RDV",
  line: "DM « DIAG » et je te fais",
  line2: "ton diagnostic complet",
  chip: "Tu veux le tien ?",
};
