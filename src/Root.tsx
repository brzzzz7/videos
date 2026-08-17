import "./index.css";
import { Composition } from "remotion";

import { MorningReel } from "./MorningReel";
import { SplitReel } from "./SplitReel";
import { Reel } from "./Reel";
import { FPS as MORNING_FPS, totalFrames as morningFrames } from "./morning";
import { FPS as SPLIT_FPS, totalFrames as splitFrames } from "./split";
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
      <Composition
        id="Split"
        component={SplitReel}
        durationInFrames={splitFrames}
        fps={SPLIT_FPS}
        width={theme.width}
        height={theme.height}
      />
      <Composition
        id="Morning"
        component={MorningReel}
        durationInFrames={morningFrames}
        fps={MORNING_FPS}
        width={theme.width}
        height={theme.height}
      />
    </>
  );
};
