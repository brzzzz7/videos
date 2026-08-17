/**
 * Copy for the morning-routine reel (composition "Morning").
 *
 * One entry per shot in src/data/morning-shots.json, in the same order. The
 * text is the auto-transcription of that shot, cleaned by hand; word timings
 * are derived from it, so editing the text is enough to move the captions.
 */

export type ShotCopy = {
  id: string;
  text: string;
  /** section label shown when this shot starts a new section */
  label?: string;
  /** longer dissolve into this shot (it opens a section) */
  section?: boolean;
};

export const copy: ShotCopy[] = [
  {
    id: "hook",
    text: "3 erreurs que tout le monde fait en se coiffant le matin.",
    section: true,
  },
  {
    id: "e1a",
    text: "Erreur numéro 1 : tu coiffes tes cheveux encore trop mouillés.",
    label: "Erreur 01",
    section: true,
  },
  { id: "e1b", text: "Tu sèches au moins à 80% avant de coiffer." },
  {
    id: "e2a",
    text: "Erreur numéro 2 : tu mets ton produit sur cheveux secs, à la fin.",
    label: "Erreur 02",
    section: true,
  },
  {
    id: "e2b",
    text: "Ça doit être appliqué pendant le séchage, ou sur cheveux légèrement humides.",
  },
  { id: "e2c", text: "Pas à la toute fin." },
  {
    id: "e3a",
    text: "Erreur numéro 3 : tu mets toujours la même quantité de produit, quel que soit le jour.",
    label: "Erreur 03",
    section: true,
  },
  {
    id: "e3b",
    text: "Cheveux propres, tu as besoin de mettre moins de produit.",
  },
  {
    id: "outro",
    text: "Ajuste selon l'état du cheveu, ne laisse pas tout en mode pilote automatique.",
    section: true,
  },
  {
    id: "ctaa",
    text: "Si tu veux que je regarde ta routine et que je te dise ce qui cloche vraiment : envoie-moi un DM.",
    section: true,
  },
  { id: "ctab", text: "Ou prends rendez-vous directement." },
];

/** Words that take the warm accent colour. */
export const emphasis = [
  "mouillés",
  "80%",
  "séchage",
  "humides",
  "fin",
  "quantité",
  "propres",
  "moins",
  "cheveu",
  "DM",
  "rendez-vous",
];

export const hook = {
  big: "3 erreurs",
  small: "que tout le monde fait le matin",
};

export const endCard = {
  big: "Envoie-moi un DM",
  small: "je regarde ta routine",
};
