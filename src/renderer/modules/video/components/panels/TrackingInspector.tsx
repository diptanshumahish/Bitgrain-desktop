import React from "react";
import { X, RefreshCw } from "lucide-react";
import {
  currentProjectSignal,
  selectedClipIdSignal,
  updateProject,
} from "../../store/project-store";
import { useSignalValue } from "../../../../lib/signal";
import type { TrackingClip, TrackingTrack } from "../../types";
import { ClipTimingControls } from "./ClipTimingControls";
import { ColorPicker } from "../../../../components/studio/ui/ColorPicker";

const SEED_RANGE = 100000;

interface SliderRowProps {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  unit?: string;
  onChange: (value: number) => void;
}

const SliderRow: React.FC<SliderRowProps> = ({ label, min, max, step, value, unit, onChange }) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center justify-between text-[10px]">
      <span className="text-[var(--s-text-muted)]">{label}</span>
      <span className="text-[var(--s-text)] tabular-nums">
        {Number.isInteger(value) ? value : value.toFixed(2)}
        {unit ?? ""}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="studio-slider w-full"
    />
  </div>
);

interface ToggleProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

const Toggle: React.FC<ToggleProps> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-1 px-2 py-1.5 rounded-md border text-[10px] transition-colors ${
      active
        ? "border-[var(--s-accent)] bg-[var(--s-accent-soft)] text-[var(--s-text)]"
        : "border-[var(--s-border)] text-[var(--s-text-subtle)] hover:text-[var(--s-text)]"
    }`}
  >
    {label}
  </button>
);

function findTrackingClip(clipId: string): { track: TrackingTrack; clip: TrackingClip } | null {
  const project = currentProjectSignal.value;
  if (!project) return null;
  for (const track of project.tracks) {
    if (track.kind !== "tracking") continue;
    const clip = track.clips.find((c) => c.id === clipId);
    if (clip) return { track, clip };
  }
  return null;
}

function patchTracking(clipId: string, patch: Partial<TrackingClip>): void {
  updateProject((project) => {
    const tracks = project.tracks.map((track) => {
      if (track.kind !== "tracking") return track;
      if (!track.clips.some((c) => c.id === clipId)) return track;
      return {
        ...track,
        clips: track.clips.map((c) => (c.id === clipId ? { ...c, ...patch } : c)),
      };
    });
    return { ...project, tracks };
  });
}

export const TrackingInspector: React.FC = () => {
  const project = useSignalValue(currentProjectSignal);
  const selectedId = useSignalValue(selectedClipIdSignal);
  const clip = project && selectedId ? (findTrackingClip(selectedId)?.clip ?? null) : null;
  if (!clip || !selectedId) return null;

  const patch = (next: Partial<TrackingClip>) => patchTracking(selectedId, next);

  return (
    <div className="flex flex-col p-4 border-b border-[var(--s-border)] animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[9px] text-[var(--s-accent)] mb-0.5">Tracking overlay</p>
          <h3 className="text-[13px] font-medium text-[var(--s-text)]">Motion HUD</h3>
        </div>
        <button
          onClick={() => (selectedClipIdSignal.value = null)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--s-text-subtle)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input)] transition-colors"
          aria-label="Deselect"
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <ClipTimingControls
          clipId={selectedId}
          trackStart={clip.trackStart}
          duration={clip.duration}
        />

        <p className="text-[10px] text-[var(--s-text-subtle)] leading-relaxed">
          Reticles lock onto motion in the footage, follow it, and drop off when it stops.
        </p>

        <div className="flex items-center gap-1.5">
          <Toggle label="Arrows" active={clip.showArrows} onClick={() => patch({ showArrows: !clip.showArrows })} />
          <Toggle label="Coords" active={clip.showCoordinates} onClick={() => patch({ showCoordinates: !clip.showCoordinates })} />
          <Toggle label="Thumbs" active={clip.showThumbnails} onClick={() => patch({ showThumbnails: !clip.showThumbnails })} />
          <Toggle label="Chip" active={clip.labelBackground ?? false} onClick={() => patch({ labelBackground: !(clip.labelBackground ?? false) })} />
        </div>

        <SliderRow label="Max markers" min={2} max={20} step={1} value={clip.nodeCount} onChange={(v) => patch({ nodeCount: v })} />
        <SliderRow label="Marker size" min={0.5} max={3} step={0.1} unit="x" value={clip.markerScale ?? 1} onChange={(v) => patch({ markerScale: v })} />
        <SliderRow label="Line width" min={0.5} max={8} step={0.1} value={clip.strokeWidth} onChange={(v) => patch({ strokeWidth: v })} />
        <SliderRow label="Label size" min={0.5} max={4} step={0.1} unit="x" value={clip.labelScale ?? 1} onChange={(v) => patch({ labelScale: v })} />
        <SliderRow label="Thumbnail zoom" min={1} max={6} step={0.1} unit="x" value={clip.thumbZoom} onChange={(v) => patch({ thumbZoom: v })} />
        <SliderRow label="Animation speed" min={0} max={3} step={0.1} unit="x" value={clip.speed} onChange={(v) => patch({ speed: v })} />

        <div className="grid grid-cols-2 gap-2">
          <ColorPicker label="Lines" color={clip.lineColor} onChange={(c) => patch({ lineColor: c })} />
          <ColorPicker label="Readouts" color={clip.labelColor} onChange={(c) => patch({ labelColor: c })} />
        </div>

        <button
          onClick={() => patch({ seed: Math.floor(Math.random() * SEED_RANGE) + 1 })}
          className="flex items-center justify-center gap-1.5 px-2 py-2 rounded-md border border-[var(--s-border)] text-[10px] text-[var(--s-text-muted)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input)] transition-colors"
        >
          <RefreshCw size={12} />
          Reshuffle markers
        </button>

        <div className="flex flex-col gap-3 pt-3.5 border-t border-[var(--s-border)]">
          <SliderRow label="Fade in" min={0} max={2} step={0.1} unit="s" value={clip.fadeIn ?? 0} onChange={(v) => patch({ fadeIn: v })} />
          <SliderRow label="Fade out" min={0} max={2} step={0.1} unit="s" value={clip.fadeOut ?? 0} onChange={(v) => patch({ fadeOut: v })} />
        </div>
      </div>
    </div>
  );
};
