import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useSignalValue } from "@bitgrain/core/signal";
import { useIsMobile } from "@bitgrain/ui/hooks/use-is-mobile";
import { onWelcome, type WelcomeEvent } from "./welcome-events";
import { openWelcome, welcomeSignal } from "./welcome-store";
import { INTRO_SCENE_COUNT, WELCOME_SCENES } from "./welcome-timing";
import { useWelcomeEnter } from "./hooks/use-welcome-enter";
import { useWelcomeExit } from "./hooks/use-welcome-exit";
import { useWelcomeAutoplay } from "./hooks/use-welcome-autoplay";
import { useWelcomeKeys } from "./hooks/use-welcome-keys";
import { useWelcomeSound } from "./hooks/use-welcome-sound";
import { warmShowcasePieces } from "./scenes/showcase-pieces";
import { ensureStudioFontsLoaded } from "@bitgrain/studio/fonts/load-studio-fonts";
import { ensureAdminFontsLoaded } from "@bitgrain/studio-core/fonts/admin-fonts";
import { preloadCuratedTemplates } from "./scenes/library/preload-curated-templates";
import { WelcomeBackdrop } from "./chrome/WelcomeBackdrop";
import { WelcomeHeader } from "./chrome/WelcomeHeader";
import { WelcomeWaves } from "./chrome/WelcomeWaves";
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
      className="fixed inset-0 z-[12000] flex flex-col overflow-hidden bg-ultramarine font-display text-white antialiased outline-none"
    >
      <WelcomeBackdrop />
      <WelcomeHeader sceneIndex={welcome.sceneIndex} isIntro={isIntro} />
      <WelcomeStage
        key={welcome.sceneIndex}
        scene={WELCOME_SCENES[welcome.sceneIndex]}
        firstName={welcome.firstName}
        lastName={welcome.lastName}
      />
      <p className={`relative z-20 pb-2 text-center text-[13px] text-white/70 ${isIntro ? "visible" : "invisible"}`}>
        {isMobile ? CONTINUE_HINT_TOUCH : CONTINUE_HINT_DESKTOP}
      </p>
      <WelcomeWaves />
    </div>,
    document.body,
  );
};
