import React from "react";
import { Music } from "lucide-react";
import { formatMinutesSeconds } from "@bitgrain/core/format/minutes-seconds";
import { clearSoundTrack, type SoundTrack } from "../track/sound-track-store";
import { SoundFilePicker } from "./SoundFilePicker";

interface TrackHeaderProps {
  track: SoundTrack;
  disabled: boolean;
}

const ICON_SIZE = 13;
const REMOVE_CLASS = "h-6 px-2 rounded text-[12px] font-medium text-[var(--s-text-muted)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input)] transition-colors disabled:opacity-50";

export const TrackHeader: React.FC<TrackHeaderProps> = ({ track, disabled }) => (
  <div className="flex items-center gap-2 px-2 min-h-8">
    <Music size={ICON_SIZE} strokeWidth={2} className="shrink-0 text-[var(--s-text-muted)]" />
    <span className="flex-1 min-w-0 truncate text-[12px] text-[var(--s-text)]" title={track.name}>{track.name}</span>
    <span className="text-[11px] text-[var(--s-text-subtle)] tabular-nums">{formatMinutesSeconds(track.buffer.duration)}</span>
    <SoundFilePicker label="Replace" quiet disabled={disabled} />
    <button type="button" onClick={clearSoundTrack} disabled={disabled} className={REMOVE_CLASS}>
      Remove
    </button>
  </div>
);
