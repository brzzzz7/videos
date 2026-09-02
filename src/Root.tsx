import "./index.css";
import { Composition } from "remotion";

import { MorningReel } from "./MorningReel";
import { PriceReel } from "./PriceReel";
import { QuestionsReel } from "./QuestionsReel";
import { StoriesReel } from "./StoriesReel";
import { ErrorsReel } from "./ErrorsReel";
import { StyleReel } from "./StyleReel";
import { SolutionsReel } from "./SolutionsReel";
import { SplitReel } from "./SplitReel";
import { Reel } from "./Reel";
import { FPS as MORNING_FPS, totalFrames as morningFrames } from "./morning";
import { FPS as PRICE_FPS, totalFrames as priceFrames } from "./price";
import { FPS as QUESTIONS_FPS, totalFrames as questionsFrames } from "./questions";
import { FPS as STORIES_FPS, totalFrames as storiesFrames } from "./stories";
import { FPS as ERRORS_FPS, totalFrames as errorsFrames } from "./errors";
import { FPS as STYLE_FPS, totalFrames as styleFrames } from "./style";
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
        id="Errors"
        component={ErrorsReel}
        durationInFrames={errorsFrames}
        fps={ERRORS_FPS}
        width={theme.width}
        height={theme.height}
      />
      <Composition
        id="Style"
        component={StyleReel}
        durationInFrames={styleFrames}
        fps={STYLE_FPS}
        width={theme.width}
        height={theme.height}
      />
      <Composition
        id="Questions"
        component={QuestionsReel}
        durationInFrames={questionsFrames}
        fps={QUESTIONS_FPS}
        width={theme.width}
        height={theme.height}
      />
      <Composition
        id="Stories"
        component={StoriesReel}
        durationInFrames={storiesFrames}
        fps={STORIES_FPS}
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
