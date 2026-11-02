import React from "react";
import { Slider } from "@bitgrain/ui/controls/panel/slider";
import type { LoopFormat } from "../../loop-settings";
import { LoopChoiceRow } from "../../export/LoopChoiceRow";
import {
  SOUND_FRAME_OPTIONS, SOUND_REACT_OPTIONS, SOUND_SECONDS_OPTIONS, SOUND_STRENGTH_MAX,
  updateSoundSettings, type SoundDrive, type SoundFrameId, type SoundSeconds, type SoundSettings,
} from "../sound-settings";
import { SOUND_DRIVE_LABELS, SOUND_FRAME_HINTS, SOUND_FRAME_LABELS, SOUND_REACT_HINTS, SOUND_REACT_LABELS } from "../sound-copy";
import { soundFrameDefaults } from "../engine/sound-frame-specs";
import { clampWindowStart } from "@bitgrain/engine/loop/sound-window";
import type { SoundTrack } from "../track/sound-track-store";

interface SoundControlsProps {
  settings: SoundSettings;
  track: SoundTrack;
  drive: SoundDrive;
  drives: readonly SoundDrive[];
  format: LoopFormat;
  disabled: boolean;
}

type AudioChoice = "on" | "off";

const HINT_CLASS = "m-0 px-2 pb-1 text-[12px] text-[var(--s-text-subtle)]";
const REACT_CHOICES = SOUND_REACT_OPTIONS.map((id) => ({ id, label: SOUND_REACT_LABELS[id] }));
const FRAME_CHOICES = SOUND_FRAME_OPTIONS.map((id) => ({ id, label: SOUND_FRAME_LABELS[id] }));
const SECONDS_CHOICES = SOUND_SECONDS_OPTIONS.map((id) => ({ id, label: `${id}s` }));
const AUDIO_CHOICES: readonly { id: AudioChoice; label: string }[] = [
  { id: "on", label: "Include" },
  { id: "off", label: "Silent" },
];

const applyWindow = (patch: Partial<SoundSettings>, settings: SoundSettings, track: SoundTrack): void => {
  const seconds = patch.seconds ?? settings.seconds;
  updateSoundSettings({ ...patch, startSeconds: clampWindowStart(settings.startSeconds, track.buffer.duration, seconds) });
};

export const SoundControls: React.FC<SoundControlsProps> = ({ settings, track, drive, drives, format, disabled }) => {
  const driveChoices = drives.map((id) => ({ id, label: SOUND_DRIVE_LABELS[id] }));
  const pickFrame = (frame: SoundFrameId): void => applyWindow({ frame, ...soundFrameDefaults(frame) }, settings, track);
  const pickSeconds = (seconds: SoundSeconds): void => applyWindow({ seconds }, settings, track);

  return (
    <div className="flex flex-col gap-1">
      <LoopChoiceRow label="React to" choices={REACT_CHOICES} value={settings.react} disabled={disabled} onChange={(react) => updateSoundSettings({ react })} />
      <p className={HINT_CLASS}>{SOUND_REACT_HINTS[settings.react]}</p>
      <LoopChoiceRow label="Moves" choices={driveChoices} value={drive} disabled={disabled} onChange={(value) => updateSoundSettings({ drive: value })} />
      <div className="px-2 pb-1">
        <Slider
          label="Strength"
          value={settings.strength}
          min={0}
          max={SOUND_STRENGTH_MAX}
          suffix="%"
          disabled={disabled}
          onChange={(strength) => updateSoundSettings({ strength })}
        />
      </div>
      <LoopChoiceRow label="Size" choices={FRAME_CHOICES} value={settings.frame} disabled={disabled} onChange={pickFrame} />
      <p className={HINT_CLASS}>{SOUND_FRAME_HINTS[settings.frame]}</p>
      <LoopChoiceRow label="Length" choices={SECONDS_CHOICES} value={settings.seconds} disabled={disabled} onChange={pickSeconds} />
      {format === "mp4" && (
        <LoopChoiceRow
          label="Track in the video"
          choices={AUDIO_CHOICES}
          value={settings.includeAudio ? "on" : "off"}
          disabled={disabled}
          onChange={(choice) => updateSoundSettings({ includeAudio: choice === "on" })}
        />
      )}
    </div>
  );
};
