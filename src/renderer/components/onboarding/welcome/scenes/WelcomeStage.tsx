import React, { useRef } from "react";
import { useStaggerReveal } from "../hooks/use-stagger-reveal";
import { advanceWelcome } from "../welcome-store";
import type { WelcomeScene } from "../welcome-timing";
import { HelloScene } from "./HelloScene";
import { ShowcaseScene } from "./ShowcaseScene";
import { EditorScene } from "./editor/EditorScene";
import { LibraryScene } from "./library/LibraryScene";
import { AnimateScene } from "./animate/AnimateScene";
import { ChooseScene } from "./ChooseScene";

const SCENE_ENTER_MS = 900;

const SCENE_KEYFRAMES: Keyframe[] = [
  { opacity: 0, transform: "scale(0.985)" },
  { opacity: 1, transform: "scale(1)" },
];

const renderScene = (scene: WelcomeScene, firstName: string, lastName: string): React.ReactNode => {
  if (scene === "hello") return <HelloScene firstName={firstName} />;
  if (scene === "showcase") return <ShowcaseScene />;
  if (scene === "library") return <LibraryScene />;
  if (scene === "animate") return <AnimateScene name={{ firstName, lastName }} />;
  if (scene === "editor") return <EditorScene name={{ firstName, lastName }} />;
  return <ChooseScene />;
};

interface WelcomeStageProps {
  scene: WelcomeScene;
  firstName: string;
  lastName: string;
}

export const WelcomeStage: React.FC<WelcomeStageProps> = ({ scene, firstName, lastName }) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const isIntro = scene !== "choose";

  useStaggerReveal(stageRef, {
    selector: "[data-scene]",
    keyframes: SCENE_KEYFRAMES,
    startMs: 0,
    stepMs: 0,
    durationMs: SCENE_ENTER_MS,
  });

  return (
    <div
      ref={stageRef}
      onClick={isIntro ? advanceWelcome : undefined}
      className={`relative z-10 flex min-h-0 flex-1 items-center justify-center overflow-y-auto overflow-x-hidden px-6 py-8 ${isIntro ? "cursor-pointer" : ""}`}
    >
      <div data-scene className="w-full">
        {renderScene(scene, firstName, lastName)}
      </div>
    </div>
  );
};
