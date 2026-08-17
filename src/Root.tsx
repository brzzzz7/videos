import "./index.css";
import { Composition } from "remotion";

import { Reel } from "./Reel";
import { FPS, totalFrames } from "./timeline";
import { theme } from "./theme";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Reel"
        component={Reel}
        durationInFrames={totalFrames}
        fps={FPS}
        width={theme.width}
        height={theme.height}
      />
    </>
  );
};
