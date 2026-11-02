import React, { useRef } from "react";
import { HUB_DESTINATIONS, type HubDestination } from "../../../landing/HubDestinations";
import { useIsMobile } from "@bitgrain/ui/hooks/use-is-mobile";
import { WelcomeText } from "../text/WelcomeText";
import { useStaggerReveal } from "../hooks/use-stagger-reveal";
import { leaveWelcome } from "../welcome-store";
import { ChooseOption } from "./ChooseOption";
import { WELCOME_CHIP_CLASS, WELCOME_HEADING_CLASS } from "../chrome/welcome-classes";

const OPTIONS_START_MS = 600;
const OPTION_STEP_MS = 120;
const OPTION_RISE_MS = 1000;

const OPTION_RISE_KEYFRAMES: Keyframe[] = [
  { opacity: 0, transform: "translateY(28px) rotate(-1.5deg)" },
  { opacity: 1, transform: "translateY(0) rotate(0deg)" },
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
      <h2 className={`text-4xl md:text-6xl ${WELCOME_HEADING_CLASS}`}>
        <WelcomeText text="What are we making first?" startMs={0} ink={{ word: "first?", mark: "underline" }} />
      </h2>
      <div className="mt-10 grid w-full gap-3 md:mt-14 md:grid-cols-2 md:gap-4 lg:grid-cols-4">
        {HUB_DESTINATIONS.map((destination) => (
          <ChooseOption key={destination.key} destination={destination} body={optionBody(destination, isMobile)} />
        ))}
      </div>
      <button type="button" data-option onClick={() => leaveWelcome("hub")} className={`mt-8 ${WELCOME_CHIP_CLASS}`}>
        I'll look around first
      </button>
    </div>
  );
};
