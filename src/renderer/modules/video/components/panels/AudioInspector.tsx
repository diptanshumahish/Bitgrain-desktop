import React from "react";
import { X } from "lucide-react";
import {
  currentProjectSignal,
  selectedClipIdSignal,
  updateProject,
} from "../../store/project-store";
import { useSignalValue } from "../../../../lib/signal";
import type { AudioClip, AudioTrack } from "../../types";
import { Toggle } from "./effects/filter-shared";
import { EqControls } from "./EqControls";
import { ClipTimingControls } from "./ClipTimingControls";

interface SliderRowProps {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  unit?: string;
  onChange: (value: number) => void;
}

const SliderRow: React.FC<SliderRowProps> = ({
  label,
  min,
  max,
  step,
  value,
  unit,
  onChange,
}) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center justify-between text-[10px]">
      <span className="text-[var(--s-text-muted)]">{label}</span>
      <span className="text-[var(--s-text)] tabular-nums">
        {value}
        {unit ?? ""}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="studio-slider w-full"
    />
  </div>
);

function findAudioClip(
  clipId: string,
): { track: AudioTrack; clip: AudioClip } | null {
  const project = currentProjectSignal.value;
  if (!project) return null;
  for (const track of project.tracks) {
    if (track.kind !== "audio") continue;
    const clip = track.clips.find((c) => c.id === clipId);
    if (clip) return { track, clip };
  }
  return null;
}

function patchAudio(clipId: string, patch: Partial<AudioClip>): void {
  updateProject((project) => {
    const tracks = project.tracks.map((track) => {
      if (track.kind !== "audio") return track;
      if (!track.clips.some((c) => c.id === clipId)) return track;
      return {
        ...track,
        clips: track.clips.map((c) =>
          c.id === clipId ? { ...c, ...patch } : c,
        ),
      };
    });
    return { ...project, tracks };
  });
}

export const AudioInspector: React.FC = () => {
  const project = useSignalValue(currentProjectSignal);
  const selectedId = useSignalValue(selectedClipIdSignal);
  if (!project || !selectedId) return null;

  const found = findAudioClip(selectedId);
  if (!found) return null;
  const clip = found.clip;
  const asset = project.mediaPool.find((a) => a.id === clip.assetId);

  return (
    <div className="flex flex-col p-4 border-b border-[var(--s-border)] animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[9px] text-[var(--s-accent)] mb-0.5">
            Audio Track
          </p>
          <h3 className="text-[13px] font-medium text-[var(--s-text)] truncate max-w-[180px]">
            {asset?.name ?? "Audio Clip"}
          </h3>
        </div>
        <button
          onClick={() => (selectedClipIdSignal.value = null)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--s-text-subtle)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input)] transition-colors"
          aria-label="Deselect"
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <ClipTimingControls
          clipId={selectedId}
          trackStart={clip.trackStart}
          duration={clip.duration}
          speed={clip.speed ?? 1}
        />
        <Toggle
          label="Mute"
          active={clip.muted ?? false}
          onClick={() => patchAudio(selectedId, { muted: !(clip.muted ?? false) })}
        />
        <SliderRow
          label="Volume"
          min={0}
          max={100}
          step={1}
          value={Math.round(clip.volume * 100)}
          unit="%"
          onChange={(v) => patchAudio(selectedId, { volume: v / 100 })}
        />
        <SliderRow
          label="Fade in"
          min={0}
          max={5}
          step={0.1}
          value={Math.round(clip.fadeIn * 10) / 10}
          unit="s"
          onChange={(v) => patchAudio(selectedId, { fadeIn: v })}
        />
        <SliderRow
          label="Fade out"
          min={0}
          max={5}
          step={0.1}
          value={Math.round(clip.fadeOut * 10) / 10}
          unit="s"
          onChange={(v) => patchAudio(selectedId, { fadeOut: v })}
        />
      </div>

      <div className="flex flex-col gap-3 mt-6 pt-4 border-t border-[var(--s-border)]">
        <EqControls
          eq={clip.eq}
          onChange={(eq) => patchAudio(selectedId, { eq })}
        />
      </div>
    </div>
  );
};
