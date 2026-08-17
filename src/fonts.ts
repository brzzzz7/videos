// Faces are inlined as data URIs (scripts/inline-fonts.py) with
// font-display: block, so they are available the moment the CSS parses — no
// font request, and nothing for a render worker to wait on.
import "./fonts.css";

export const DISPLAY = "Anton";
export const UI = "Inter";
export const SANS = "Montserrat";
