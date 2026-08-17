export const theme = {
  ink: "#08080A",
  paper: "#FFFFFF",
  gold: "#FFC53D",
  goldDeep: "#F59E00",
  punch: "#FF4D3D",
  mute: "rgba(255,255,255,0.55)",
  // Instagram's chrome eats the bottom ~330px and the right ~180px of a reel.
  safe: { bottom: 330, top: 120, side: 72 },
  width: 1080,
  height: 1920,
} as const;

export const shadow = {
  text: "0 8px 28px rgba(0,0,0,0.55)",
  card: "0 30px 90px rgba(0,0,0,0.65)",
};

/** Heavy outline so subtitles stay readable over any frame. */
export const stroke = (px: number, color = "#000") => ({
  WebkitTextStroke: `${px}px ${color}`,
  paintOrder: "stroke fill" as const,
});
