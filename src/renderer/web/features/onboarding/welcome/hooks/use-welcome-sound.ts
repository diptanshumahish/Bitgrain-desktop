import { useEffect } from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import { welcomeMutedSignal } from "../sound/welcome-sound-store";
import {
  swooshWelcomeScene,
  popWelcomeClick,
  setWelcomeSoundMuted,
  startWelcomeSound,
  stopWelcomeSound,
} from "../sound/welcome-sound";

export const useWelcomeSound = (isPlaying: boolean, sceneIndex: number): void => {
  const muted = useSignalValue(welcomeMutedSignal);

  useEffect(() => {
    if (!isPlaying) return;
    startWelcomeSound(welcomeMutedSignal.value);
    return stopWelcomeSound;
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying && sceneIndex > 0) swooshWelcomeScene();
  }, [isPlaying, sceneIndex]);

  useEffect(() => {
    if (!isPlaying) return;
    window.addEventListener("pointerdown", popWelcomeClick);
    return () => window.removeEventListener("pointerdown", popWelcomeClick);
  }, [isPlaying]);

  useEffect(() => setWelcomeSoundMuted(muted), [muted]);
};
