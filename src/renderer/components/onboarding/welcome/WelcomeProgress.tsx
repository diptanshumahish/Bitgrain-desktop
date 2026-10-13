import React from "react";
import { WelcomeProgressSegment, type SegmentState } from "./WelcomeProgressSegment";
import { INTRO_SCENE_COUNT, SCENE_DURATIONS_MS, WELCOME_SCENES } from "./welcome-timing";

const INTRO_SCENES = WELCOME_SCENES.slice(0, INTRO_SCENE_COUNT);

const segmentState = (segmentIndex: number, sceneIndex: number): SegmentState => {
  if (segmentIndex < sceneIndex) return "done";
  if (segmentIndex === sceneIndex) return "active";
  return "upcoming";
};

interface WelcomeProgressProps {
  sceneIndex: number;
}

export const WelcomeProgress: React.FC<WelcomeProgressProps> = ({ sceneIndex }) => (
  <div className="flex w-32 gap-1.5 md:w-48">
    {INTRO_SCENES.map((scene, index) => (
      <WelcomeProgressSegment
        key={scene}
        state={segmentState(index, sceneIndex)}
        durationMs={SCENE_DURATIONS_MS[scene] ?? 0}
      />
    ))}
  </div>
);
