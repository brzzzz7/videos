/**
 * Copy and cues for the split-screen reel (composition "Split").
 *
 * The clip arrived already derushed, so nothing is cut here: the phrases below
 * are exactly his speech segments, delimited by his own pauses, and the reel
 * runs the source end to end. Auto-transcribed then cleaned by hand.
 */

/** The cue sounds live in one list, shared by every reel. */
import type { Sfx } from "../lib/sfx";

export type { Sfx };

export type Phrase = { start: number; end: number; text: string };

export const phrases: Phrase[] = [
  { start: 0.35, end: 5.16, text: "3 erreurs que tout le monde fait en se coiffant le matin. Erreur numéro 1 : tu coiffes tes cheveux encore trop mouillés." },
  { start: 5.49, end: 6.92, text: "Le cheveu mouillé est élastique," },
  { start: 7.15, end: 12.49, text: "il change de forme en séchant. Tout ce que tu coiffes à ce moment-là ne va pas tenir. Tu sèches au moins à 80% avant de coiffer." },
  { start: 12.82, end: 16.17, text: "Erreur numéro 2 : tu mets ton produit sur les cheveux secs, à la fin." },
  { start: 16.52, end: 18.15, text: "Un produit coiffant, une cire," },
  { start: 18.52, end: 23.36, text: "un gel, une crème, ça doit être appliqué pendant le séchage ou sur cheveux légèrement humides." },
  { start: 23.92, end: 24.78, text: "Pas à la toute fin." },
  { start: 25.22, end: 30.17, text: "Sinon il en reste en surface et ça fait cheveux figés, pas naturels. Attention, il y a des exceptions" },
  { start: 30.57, end: 31.39, text: "pour certaines coupes." },
  { start: 31.59, end: 37.83, text: "Par exemple des coupes avec des cires mates, pour un effet décoiffé et volumineux. Là par exemple on va" },
  { start: 38.08, end: 43.84, text: "en mettre sur des cheveux bien secs. Et erreur numéro 3 : tu mets toujours la même quantité de produit, quel que soit le jour." },
  { start: 44.26, end: 53.39, text: "Quand t'as des cheveux propres, t'as besoin de mettre moins de produit. Au jour 2 ou 3 après ton shampoing, tu peux commencer à mettre un peu plus de produit, parce que tes cheveux ont perdu de l'huile naturelle." },
  { start: 53.81, end: 55.32, text: "Ajuste selon l'état du cheveu." },
  { start: 55.56, end: 57.33, text: "Ne laisse pas tout en mode pilote automatique." },
  { start: 57.78, end: 62.68, text: "Si tu veux que je regarde ta routine et que je te dise ce qui cloche vraiment : envoie-moi un DM ou prends rendez-vous directement." },
];

/** Words that take the warm accent colour. */
export const emphasis = [
  "3",
  "mouillés",
  "élastique",
  "80%",
  "secs",
  "fin",
  "séchage",
  "humides",
  "figés",
  "mates",
  "volumineux",
  "quantité",
  "propres",
  "moins",
  "plus",
  "cheveu",
  "DM",
  "rendez-vous",
];

export type Illo =
  | { kind: "counter" }
  | { kind: "gauge"; from: number; to: number; caption: string; title?: string; danger?: boolean }
  | { kind: "strand" }
  | { kind: "timeline"; good: boolean; moveAt?: number }
  | { kind: "products" }
  | { kind: "matte" }
  | { kind: "doses" }
  | { kind: "cta" };

export type Cue = {
  /** source seconds */
  at: number;
  until: number;
  illo: Illo;
  /** light sound played as the panel opens — never the same as the cue before */
  sfx: Sfx;
};

/**
 * The screen only splits on the statements worth illustrating, and it stays open
 * long enough to be read: six panels over a minute, not one per sentence. The
 * first version changed panel every three seconds and read as bouncing.
 */
export const cues: Cue[] = [
  { at: 0.6, until: 4.2, illo: { kind: "counter" }, sfx: "pop" },
  {
    at: 9.9,
    until: 12.9,
    illo: { kind: "gauge", from: 100, to: 80, caption: "sèche-les à 80% avant de coiffer", title: "erreur 01" },
    sfx: "chime",
  },
  // one panel for the whole of mistake 2: the product marker starts at the
  // wrong end of the routine and slides to the right one when he says it
  { at: 13.0, until: 23.4, illo: { kind: "timeline", good: false, moveAt: 180 }, sfx: "swoosh" },
  { at: 31.8, until: 37.9, illo: { kind: "matte" }, sfx: "pop" },
  { at: 44.3, until: 53.4, illo: { kind: "doses" }, sfx: "chime" },
  { at: 57.9, until: 63.13, illo: { kind: "cta" }, sfx: "lift" },
];

export const hook = {
  big: "3 erreurs",
  small: "que tout le monde fait le matin",
};
