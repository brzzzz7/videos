import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

/**
 * 220x220 tile of static, rasterised once by the browser and then only
 * repositioned — cheap per-frame film grain.
 */
const NOISE =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='220' height='220' filter='url(%23n)' opacity='0.55'/></svg>\")";

export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.09 }) => {
  const frame = useCurrentFrame();
  // jump the tile around so the grain never sits still
  const x = (frame * 37) % 220;
  const y = (frame * 61) % 220;

  return (
    <AbsoluteFill
      style={{
        backgroundImage: NOISE,
        backgroundPosition: `${x}px ${y}px`,
        opacity,
        mixBlendMode: "overlay",
        pointerEvents: "none",
      }}
    />
  );
};

/** Cinematic edge darkening, keeps the eye on the middle of the frame. */
export const Vignette: React.FC<{ strength?: number }> = ({
  strength = 0.55,
}) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 42%, rgba(0,0,0,${strength}) 100%)`,
      pointerEvents: "none",
    }}
  />
);
