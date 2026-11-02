import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useSignalValue } from "../../../lib/signal";
import { useIsMobile } from "../../../hooks/useIsMobile";
import { onWelcome, type WelcomeEvent } from "./welcome-events";
import { openWelcome, skipWelcomeIntro, welcomeSignal } from "./welcome-store";
import { INTRO_SCENE_COUNT, WELCOME_SCENES } from "./welcome-timing";
import { useWelcomeEnter } from "./hooks/use-welcome-enter";
import { useWelcomeExit } from "./hooks/use-welcome-exit";
import { useWelcomeAutoplay } from "./hooks/use-welcome-autoplay";
import { useWelcomeKeys } from "./hooks/use-welcome-keys";
import { useWelcomeSound } from "./hooks/use-welcome-sound";
import { WelcomeSoundToggle } from "./WelcomeSoundToggle";
import { warmShowcasePieces } from "./scenes/showcase-pieces";
import { ensureStudioFontsLoaded } from "../../../lib/load-studio-fonts";
import { ensureAdminFontsLoaded } from "../../../lib/admin-fonts";
import { preloadCuratedTemplates } from "./scenes/library/preload-curated-templates";
import { WelcomeBackdrop } from "./WelcomeBackdrop";
import { WelcomeProgress } from "./WelcomeProgress";
import { WelcomeStage } from "./scenes/WelcomeStage";

const CONTINUE_HINT_DESKTOP = "Click anywhere or press space to continue";
const CONTINUE_HINT_TOUCH = "Tap anywhere to continue";

const startWelcome = (event: WelcomeEvent): void => {
  warmShowcasePieces();
  ensureStudioFontsLoaded();
  void ensureAdminFontsLoaded();
  preloadCuratedTemplates();
  openWelcome(event);
};

export const WelcomePortal: React.FC = () => {
  const welcome = useSignalValue(welcomeSignal);
  const rootRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const isPlaying = welcome !== null && !welcome.leaving;

  useEffect(() => onWelcome(startWelcome), []);
  useWelcomeEnter(rootRef, welcome !== null);
  useWelcomeExit(rootRef, welcome?.leaving ?? false);
  useWelcomeAutoplay(isPlaying ? welcome.sceneIndex : null);
  useWelcomeKeys(isPlaying);
  useWelcomeSound(isPlaying, welcome?.sceneIndex ?? 0);

  if (!welcome) return null;
  const isIntro = welcome.sceneIndex < INTRO_SCENE_COUNT;

  return createPortal(
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Bitgrain"
      tabIndex={-1}
      className="fixed inset-0 z-[12000] flex flex-col overflow-hidden bg-[#0a0a0a] font-editorial text-white antialiased outline-none"
    >
      <WelcomeBackdrop />
      <header className="relative z-20 grid grid-cols-3 items-center px-5 pt-5 md:px-8 md:pt-7">
        <span className="flex items-center gap-2.5">
          <img src="/bitgrainlogo.png" alt="" className="h-7 w-7 rounded-md object-cover" />
          <span className="hidden text-[15px] font-medium text-white/80 sm:inline">bitgrain</span>
        </span>
        <span className="flex justify-center">{isIntro && <WelcomeProgress sceneIndex={welcome.sceneIndex} />}</span>
        <span className="flex items-center justify-end gap-1">
          <WelcomeSoundToggle />
          {isIntro && (
            <button
              type="button"
              onClick={skipWelcomeIntro}
              className="rounded-full px-3 py-1.5 text-sm text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            >
              Skip intro
            </button>
          )}
        </span>
      </header>
      <WelcomeStage
        key={welcome.sceneIndex}
        scene={WELCOME_SCENES[welcome.sceneIndex]}
        firstName={welcome.firstName}
        lastName={welcome.lastName}
      />
      <p className={`relative z-20 pb-6 text-center text-xs text-white/35 ${isIntro ? "visible" : "invisible"}`}>
        {isMobile ? CONTINUE_HINT_TOUCH : CONTINUE_HINT_DESKTOP}
      </p>
    </div>,
    document.body,
  );
};
