import React from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import type { LoopFormat } from "../../loop-settings";
import { LoopChoiceRow } from "../../export/LoopChoiceRow";
import { soundSettingsSignal, updateSoundSettings, type SoundDrive } from "../sound-settings";
import { SOUND_GIF_HINT } from "../sound-copy";
import { soundTrackErrorSignal, soundTrackSignal } from "../track/sound-track-store";
import { SoundFilePicker } from "./SoundFilePicker";
import { TrackHeader } from "./TrackHeader";
import { WaveformStrip } from "./WaveformStrip";
import { SoundControls } from "./SoundControls";

interface SoundSectionProps {
  format: LoopFormat;
  drive: SoundDrive;
  drives: readonly SoundDrive[];
  disabled: boolean;
}

type SoundChoice = "off" | "on";

const SOUND_CHOICES: readonly { id: SoundChoice; label: string }[] = [
  { id: "off", label: "None" },
  { id: "on", label: "Your track" },
];
const HINT_CLASS = "m-0 px-2 text-[12px] text-[var(--s-text-subtle)]";
const ERROR_CLASS = "m-0 px-2 text-[12px] text-red-600 dark:text-red-400";

export const SoundSection: React.FC<SoundSectionProps> = ({ format, drive, drives, disabled }) => {
  const settings = useSignalValue(soundSettingsSignal);
  const track = useSignalValue(soundTrackSignal);
  const error = useSignalValue(soundTrackErrorSignal);
  const toggle = (choice: SoundChoice): void => updateSoundSettings({ enabled: choice === "on" });

  return (
    <div className="flex flex-col gap-1.5">
      <LoopChoiceRow label="Sound" choices={SOUND_CHOICES} value={settings.enabled ? "on" : "off"} disabled={disabled} onChange={toggle} />
      {settings.enabled && !track && (
        <div className="flex flex-col gap-1.5 px-2 pb-1">
          <SoundFilePicker label="Add a track, mp3, wav or m4a" quiet={false} disabled={disabled} />
          <p className="m-0 text-[12px] text-[var(--s-text-subtle)]">The look pulses with your music. Your track never leaves this device.</p>
        </div>
      )}
      {settings.enabled && track && (
        <>
          <TrackHeader track={track} disabled={disabled} />
          <WaveformStrip track={track} startSeconds={settings.startSeconds} seconds={settings.seconds} />
          <SoundControls settings={settings} track={track} drive={drive} drives={drives} format={format} disabled={disabled} />
          {format === "gif" && <p className={HINT_CLASS}>{SOUND_GIF_HINT}</p>}
        </>
      )}
      {settings.enabled && error && <p role="alert" className={ERROR_CLASS}>{error}</p>}
    </div>
  );
};
