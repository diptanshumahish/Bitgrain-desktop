import React, { useRef } from "react";
import { HUB_DESTINATIONS, type HubDestination } from "../../../../pages/landing-page/HubDestinations";
import { useIsMobile } from "../../../../hooks/useIsMobile";
import { WelcomeText } from "../WelcomeText";
import { useStaggerReveal } from "../hooks/use-stagger-reveal";
import { leaveWelcome } from "../welcome-store";
import { ChooseOption } from "./ChooseOption";

const OPTIONS_START_MS = 600;
const OPTION_STEP_MS = 120;
const OPTION_RISE_MS = 1000;

const OPTION_RISE_KEYFRAMES: Keyframe[] = [
  { opacity: 0, transform: "translateY(28px)", filter: "blur(6px)" },
  { opacity: 1, transform: "translateY(0)", filter: "blur(0px)" },
];

const optionBody = (destination: HubDestination, isMobile: boolean): string =>
  isMobile && destination.mobileNote ? destination.mobileNote : destination.body;

export const ChooseScene: React.FC = () => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useStaggerReveal(sceneRef, {
    selector: "[data-option]",
    keyframes: OPTION_RISE_KEYFRAMES,
    startMs: OPTIONS_START_MS,
    stepMs: OPTION_STEP_MS,
    durationMs: OPTION_RISE_MS,
  });

  return (
    <div ref={sceneRef} className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
      <h2 className="text-balance text-4xl font-medium tracking-tight md:text-6xl">
        <WelcomeText text="What are we making first?" startMs={0} />
      </h2>
      <div className="mt-10 grid w-full gap-3 md:mt-14 md:grid-cols-3">
        {HUB_DESTINATIONS.map((destination) => (
          <ChooseOption key={destination.key} destination={destination} body={optionBody(destination, isMobile)} />
        ))}
      </div>
      <button
        type="button"
        data-option
        onClick={() => leaveWelcome("hub")}
        className="mt-8 text-sm text-white/50 transition-colors hover:text-white"
      >
        I'll look around first
      </button>
    </div>
  );
};
