import { useEffect } from "react";
import { advanceWelcome } from "../welcome-store";
import { SCENE_DURATIONS_MS, WELCOME_SCENES } from "../welcome-timing";

export const useWelcomeAutoplay = (sceneIndex: number | null): void => {
  useEffect(() => {
    if (sceneIndex === null) return;
    const duration = SCENE_DURATIONS_MS[WELCOME_SCENES[sceneIndex]];
    if (duration === null) return;
    const timer = window.setTimeout(advanceWelcome, duration);
    return () => window.clearTimeout(timer);
  }, [sceneIndex]);
};
