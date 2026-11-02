import React, { useRef } from "react";
import { Music } from "lucide-react";
import { useSignalValue } from "@bitgrain/core/signal";
import { loadSoundTrack, soundTrackLoadingSignal } from "../track/sound-track-store";

interface SoundFilePickerProps {
  label: string;
  quiet: boolean;
  disabled: boolean;
}

const ACCEPT = "audio/mpeg,audio/wav,audio/x-wav,audio/mp4,audio/x-m4a,audio/aac,.mp3,.wav,.m4a,.aac";
const ICON_SIZE = 13;
const PROMINENT_CLASS = "h-9 w-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--s-border)] text-[12px] font-medium text-[var(--s-text)] hover:bg-[var(--s-bg-input-hover)] transition-colors disabled:opacity-50";
const QUIET_CLASS = "h-6 px-2 rounded text-[12px] font-medium text-[var(--s-text-muted)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input)] transition-colors disabled:opacity-50";

const pickFile = (event: React.ChangeEvent<HTMLInputElement>): void => {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (file) void loadSoundTrack(file);
};

export const SoundFilePicker: React.FC<SoundFilePickerProps> = ({ label, quiet, disabled }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const loading = useSignalValue(soundTrackLoadingSignal);

  return (
    <>
      <input ref={inputRef} type="file" accept={ACCEPT} className="hidden" onChange={pickFile} />
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => inputRef.current?.click()}
        className={quiet ? QUIET_CLASS : PROMINENT_CLASS}
      >
        {!quiet && <Music size={ICON_SIZE} strokeWidth={2} />}
        {loading ? "Reading your track…" : label}
      </button>
    </>
  );
};
