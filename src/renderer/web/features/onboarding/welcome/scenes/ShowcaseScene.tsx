import React, { useRef } from "react";
import { WelcomeText } from "../text/WelcomeText";
import { useStaggerReveal } from "../hooks/use-stagger-reveal";
import { SHOWCASE_PIECES } from "./showcase-pieces";
import { HomeShowcaseArt } from "../../../landing/home/showcase/HomeShowcaseArt";
import { showcaseAspectClass } from "../../../landing/home/showcase/home-showcase-items";
import { WELCOME_FRAME_CLASS, WELCOME_HEADING_CLASS, WELCOME_SUBLINE_CLASS } from "../chrome/welcome-classes";

const SUBLINE_START_MS = 500;
const PIECES_START_MS = 1000;
const PIECE_STEP_MS = 650;
const PIECE_DEVELOP_MS = 1800;

const DEVELOP_KEYFRAMES: Keyframe[] = [
  { opacity: 0, filter: "blur(14px) brightness(1.6) contrast(0.7)", transform: "translateY(48px) scale(0.96)" },
  { opacity: 1, filter: "blur(0px) brightness(1) contrast(1)", transform: "translateY(0) scale(1)" },
];

export const ShowcaseScene: React.FC = () => {
  const sceneRef = useRef<HTMLDivElement>(null);

  useStaggerReveal(sceneRef, {
    selector: "[data-piece]",
    keyframes: DEVELOP_KEYFRAMES,
    startMs: PIECES_START_MS,
    stepMs: PIECE_STEP_MS,
    durationMs: PIECE_DEVELOP_MS,
  });

  return (
    <div ref={sceneRef} className="mx-auto flex max-w-6xl flex-col items-center text-center">
      <h2 className={`text-3xl md:text-5xl ${WELCOME_HEADING_CLASS}`}>
        <WelcomeText text="Made to be printed, posted and pinned up." startMs={0} ink={{ word: "printed,", mark: "underline" }} />
      </h2>
      <p className={WELCOME_SUBLINE_CLASS}>
        <WelcomeText text="Screen print colours, halftone and real type, in layouts you can edit." startMs={SUBLINE_START_MS} />
      </p>
      <div className="mt-10 flex items-start justify-center gap-6 md:mt-12 md:gap-8">
        {SHOWCASE_PIECES.map(({ item, visibilityClass, tiltClass }) => (
          <figure key={item.id} data-piece className={`text-left ${visibilityClass} ${tiltClass}`}>
            <div className={WELCOME_FRAME_CLASS}>
              <div className={`relative h-[min(400px,42vh)] overflow-hidden rounded-xl ${showcaseAspectClass(item)}`}>
                <HomeShowcaseArt item={item} />
              </div>
            </div>
            <figcaption className="mt-3 px-1">
              <span className="block text-[14px] font-medium text-white">{item.name}</span>
              <span className="block text-[13px] text-white/70">{item.format}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
};
