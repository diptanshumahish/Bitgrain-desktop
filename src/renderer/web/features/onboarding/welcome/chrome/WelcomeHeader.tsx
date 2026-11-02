import React from "react";
import { skipWelcomeIntro } from "../welcome-store";
import { WelcomeProgress } from "./WelcomeProgress";
import { WelcomeSoundToggle } from "./WelcomeSoundToggle";
import { WELCOME_CHIP_CLASS } from "./welcome-classes";

interface WelcomeHeaderProps {
  sceneIndex: number;
  isIntro: boolean;
}

export const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ sceneIndex, isIntro }) => (
  <header className="relative z-20 grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-5 pt-5 md:px-8 md:pt-7">
    <span className="flex items-center gap-2.5">
      <img src="/bitgrainlogo.png" alt="" className="h-7 w-7 rounded-md object-cover" />
      <span className="hidden text-[15px] font-medium text-white sm:inline">bitgrain</span>
    </span>
    <span className="flex justify-center">{isIntro && <WelcomeProgress sceneIndex={sceneIndex} />}</span>
    <span className="flex items-center justify-end gap-1">
      <WelcomeSoundToggle />
      {isIntro && (
        <button type="button" onClick={skipWelcomeIntro} className={WELCOME_CHIP_CLASS}>
          Skip intro
        </button>
      )}
    </span>
  </header>
);
