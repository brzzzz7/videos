import "./index.css";
import { Composition } from "remotion";

import { MorningReel } from "./MorningReel";
import { PriceReel } from "./PriceReel";
import { SolutionsReel } from "./SolutionsReel";
import { SplitReel } from "./SplitReel";
import { Reel } from "./Reel";
import { FPS as MORNING_FPS, totalFrames as morningFrames } from "./morning";
import { FPS as PRICE_FPS, totalFrames as priceFrames } from "./price";
import { FPS as SOLUTIONS_FPS, totalFrames as solutionsFrames } from "./solutions";
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
        id="Price"
        component={PriceReel}
        durationInFrames={priceFrames}
        fps={PRICE_FPS}
        width={theme.width}
        height={theme.height}
      />
      <Composition
        id="Solutions"
        component={SolutionsReel}
        durationInFrames={solutionsFrames}
        fps={SOLUTIONS_FPS}
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
