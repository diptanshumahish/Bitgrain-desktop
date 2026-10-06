import { useEffect } from "react";
import { startAudioEngine } from "../engine/audio-engine";

export function useAudioEngine(): void {
  useEffect(() => {
    const stop = startAudioEngine();
    return stop;
  }, []);
}
