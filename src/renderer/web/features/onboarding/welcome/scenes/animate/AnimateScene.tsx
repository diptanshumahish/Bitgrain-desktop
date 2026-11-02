import React from "react";
import { WelcomeText } from "../../text/WelcomeText";
import { WELCOME_HEADING_CLASS, WELCOME_SUBLINE_CLASS } from "../../chrome/welcome-classes";
import { AnimatedPoster } from "./AnimatedPoster";
import { AnimationTimeline } from "./AnimationTimeline";
import type { PosterName } from "../editor/timeline/build-frame-template";

const SUBLINE_START_MS = 500;

interface AnimateSceneProps {
  name: PosterName;
}

export const AnimateScene: React.FC<AnimateSceneProps> = ({ name }) => (
  <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
    <h2 className={`text-3xl md:text-5xl ${WELCOME_HEADING_CLASS}`}>
      <WelcomeText text="Then make it move." startMs={0} ink={{ word: "move.", mark: "underline" }} />
    </h2>
    <p className={WELCOME_SUBLINE_CLASS}>
      <WelcomeText text="Give any layer an entrance, then export a video for reels, stories and screens." startMs={SUBLINE_START_MS} />
    </p>
    <div className="mt-8 flex w-full items-stretch justify-center gap-6 md:mt-10">
      <AnimatedPoster name={name} />
      <div className="hidden min-w-0 flex-1 md:flex">
        <AnimationTimeline />
      </div>
    </div>
  </div>
);
