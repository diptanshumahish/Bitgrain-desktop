import React from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useSignalValue } from "../../../lib/signal";
import { toggleWelcomeMuted, welcomeMutedSignal } from "./sound/welcome-sound-store";

export const WelcomeSoundToggle: React.FC = () => {
  const muted = useSignalValue(welcomeMutedSignal);
  const Icon = muted ? VolumeX : Volume2;

  return (
    <button
      type="button"
      onClick={toggleWelcomeMuted}
      aria-label={muted ? "Turn sound on" : "Turn sound off"}
      aria-pressed={!muted}
      className="flex h-8 w-8 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white"
    >
      <Icon size={16} strokeWidth={1.75} />
    </button>
  );
};
