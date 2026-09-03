/**
 * The cue-sound library.
 *
 * One list, imported by every reel: adding a sound should not mean editing
 * seven files, and a name that is not in `public/sfx/` should not typecheck.
 *
 * The first six are synthesised by `scripts/sfx-light.py`. The rest are
 * recorded samples he sent, conditioned by `scripts/prepare-sfx.py` — trimmed,
 * resampled to 48 kHz and set to −1 dBFS, which is also what removed the two
 * clipped samples the shutter arrived with.
 *
 * `sweep` and `sweep-long` are his whooshes. They are deliberately not called
 * "whoosh": `swoosh` is already in this list, and two names a letter apart in a
 * string union is a wrong pick waiting to happen.
 */
export const SFX = [
  "pop",
  "tick",
  "chime",
  "swoosh",
  "marimba",
  "lift",
  "flash",
  "shutter",
  "snap",
  "sweep",
  "sweep-long",
] as const;

export type Sfx = (typeof SFX)[number];

export const sfxFile = (name: Sfx) => `sfx/${name}.m4a`;
