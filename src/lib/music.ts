/**
 * The background-bed library.
 *
 * The first three are synthesised by `scripts/music.py`; `thankyou` is a track
 * he supplied, cut and levelled by `scripts/prepare-music.py`.
 *
 * They are listed with their integrated loudness because that is what the
 * reels' volume ramps are written against: a bed at −17 LUFS behaves under a
 * ramp value of 0.1 the way a bed at −12 LUFS does not. Anything added here
 * should be conditioned to about −17 before it is used with the existing ramps.
 */
export const BEDS = {
  /** 100 bpm minor beat, driving — the first reel. */
  music: { file: "music.m4a", lufs: -11.6, vocals: false },
  /** 104 bpm major, marimba and brushes — light and professional. */
  "music-light": { file: "music-light.m4a", lufs: -14.9, vocals: false },
  /** 96 bpm A-minor build — the one most reels use. */
  "music-suspense": { file: "music-suspense.m4a", lufs: -16.9, vocals: false },
  /**
   * A supplied track, from its own opening. It is a full vocal song — the
   * first 12 s are instrumental and the singing starts after that — so it
   * wants a lower ramp under speech than the instrumental beds do.
   */
  "music-thankyou": { file: "music-thankyou.m4a", lufs: -16.9, vocals: true },
} as const;

export type Bed = keyof typeof BEDS;

export const bedFile = (name: Bed) => BEDS[name].file;
