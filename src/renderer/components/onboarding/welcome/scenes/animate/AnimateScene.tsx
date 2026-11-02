import React from "react";
import { WelcomeText } from "../../WelcomeText";
import { AnimatedPoster } from "./AnimatedPoster";
import { AnimationTimeline } from "./AnimationTimeline";
import type { PosterName } from "../editor/timeline/build-frame-template";

const SUBLINE_START_MS = 500;

interface AnimateSceneProps {
  name: PosterName;
}

export const AnimateScene: React.FC<AnimateSceneProps> = ({ name }) => (
  <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
    <h2 className="text-balance text-3xl font-medium tracking-tight md:text-5xl">
      <WelcomeText text="Then make it move." startMs={0} />
    </h2>
    <p className="mt-3 text-balance text-base text-white/55 md:text-lg">
      <WelcomeText text="Give any layer an entrance, then export a video for reels, stories and screens." startMs={SUBLINE_START_MS} />
    </p>
    <div className="mt-8 flex w-full items-stretch justify-center gap-5 md:mt-10">
      <AnimatedPoster name={name} />
      <div className="hidden min-w-0 flex-1 md:flex">
        <AnimationTimeline />
      </div>
    </div>
  </div>
);
