import React from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useSignalValue } from "@bitgrain/core/signal";
import { toggleWelcomeMuted, welcomeMutedSignal } from "../sound/welcome-sound-store";
import { WELCOME_ICON_CHIP_CLASS } from "./welcome-classes";

export const WelcomeSoundToggle: React.FC = () => {
  const muted = useSignalValue(welcomeMutedSignal);
  const Icon = muted ? VolumeX : Volume2;

  return (
    <button
      type="button"
      onClick={toggleWelcomeMuted}
      aria-label={muted ? "Turn sound on" : "Turn sound off"}
      aria-pressed={!muted}
      className={WELCOME_ICON_CHIP_CLASS}
    >
      <Icon size={16} strokeWidth={1.75} />
    </button>
  );
};
