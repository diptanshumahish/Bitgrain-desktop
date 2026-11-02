import React, { useRef } from "react";
import { WelcomeText } from "../WelcomeText";
import { useStaggerReveal } from "../hooks/use-stagger-reveal";
import { SHOWCASE_PIECES } from "./showcase-pieces";

const SUBLINE_START_MS = 500;
const PIECES_START_MS = 1000;
const PIECE_STEP_MS = 650;
const PIECE_DEVELOP_MS = 1800;

const DEVELOP_KEYFRAMES: Keyframe[] = [
  { opacity: 0, filter: "blur(18px) brightness(2.2) contrast(0.6)", transform: "translateY(40px) scale(0.96)" },
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
      <h2 className="text-balance text-3xl font-medium tracking-tight md:text-5xl">
        <WelcomeText text="Every photo has a few more lives in it." startMs={0} />
      </h2>
      <p className="mt-3 text-balance text-base text-white/55 md:text-lg">
        <WelcomeText text="Halftone, etching and CMYK, set into real layouts." startMs={SUBLINE_START_MS} />
      </p>
      <div className="mt-10 flex items-start justify-center gap-5 md:mt-12 md:gap-6">
        {SHOWCASE_PIECES.map(({ id, name, process, aspectClass, visibilityClass, Design }) => (
          <figure key={id} data-piece className={`text-left ${visibilityClass}`}>
            <div className={`relative h-[min(440px,48vh)] overflow-hidden rounded-lg ring-1 ring-white/10 ${aspectClass}`}>
              <Design />
            </div>
            <figcaption className="mt-3">
              <span className="block text-[14px] font-medium text-white">{name}</span>
              <span className="block text-[13px] text-white/45">{process}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
};
