import React from "react";
import { X, Maximize, Plus, Trash2, Volume2 } from "lucide-react";
import {
  currentProjectSignal,
  selectedClipIdSignal,
  updateProject,
} from "../../store/project-store";
import { useSignalValue } from "../../../../lib/signal";
import type {
  VideoClip,
  VideoTrack,
  Track,
  EffectApplication,
  TransformMode,
} from "../../types";
import { newId } from "../../utils/id";
import { setClipFade } from "../../utils/clip-mutations";
import { maxFadeForClip } from "../../utils/clip-fade";
import { CLIP_FADE_STEP_SECONDS } from "../../constants";
import { Toggle } from "./effects/filter-shared";
import { EqControls } from "./EqControls";
import { ClipTimingControls } from "./ClipTimingControls";
import { detachClipAudio, unlinkClip } from "../../utils/clip-link";

const EFFECT_MODES: { id: TransformMode; label: string }[] = [
  { id: "grayscale", label: "Grayscale" },
  { id: "invert", label: "Invert" },
  { id: "pixelate", label: "Pixelate" },
  { id: "grain", label: "Grain / Noise" },
  { id: "ascii", label: "ASCII Art" },
  { id: "dither", label: "Retro Dither" },
];

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

function findVideoClip(
  clipId: string,
): { track: VideoTrack; clip: VideoClip } | null {
  const project = currentProjectSignal.value;
  if (!project) return null;
  for (const track of project.tracks) {
    if (track.kind !== "video") continue;
    const clip = track.clips.find((c) => c.id === clipId);
    if (clip) return { track, clip };
  }
  return null;
}

function cloneTrack(track: Track): Track {
  switch (track.kind) {
    case "video":
      return { ...track, clips: [...track.clips] };
    case "audio":
      return { ...track, clips: [...track.clips] };
    case "text":
      return { ...track, clips: [...track.clips] };
    case "effect":
      return { ...track, clips: [...track.clips] };
    case "image":
      return { ...track, clips: [...track.clips] };
    case "tracking":
      return { ...track, clips: [...track.clips] };
  }
}

function patchVideoClip(clipId: string, patch: Partial<VideoClip>): void {
  updateProject((project) => {
    const tracks = project.tracks.map(cloneTrack);
    for (const track of tracks) {
      if (track.kind !== "video") continue;
      const idx = track.clips.findIndex((c) => c.id === clipId);
      if (idx >= 0) {
        const clip = track.clips[idx];
        // Handle nested patch for transform or effects
        if (patch.transform) {
          clip.transform = { ...clip.transform, ...patch.transform };
        } else if (patch.effects) {
          clip.effects = patch.effects;
        } else {
          Object.assign(clip, patch);
        }
        break;
      }
    }
    return { ...project, tracks };
  });
}

export const VideoInspector: React.FC = () => {
  const project = useSignalValue(currentProjectSignal);
  const selectedId = useSignalValue(selectedClipIdSignal);
  if (!project || !selectedId) return null;

  const found = findVideoClip(selectedId);
  if (!found) return null;
  const clip = found.clip;
  const asset = project.mediaPool.find((a) => a.id === clip.assetId);

  const addEffect = (mode: TransformMode) => {
    const newEffect: EffectApplication = {
      id: newId(),
      mode,
      params: {
        brightness: 1,
        contrast: 1,
        saturation: 1,
      },
    };
    patchVideoClip(selectedId, { effects: [...clip.effects, newEffect] });
  };

  const removeEffect = (effectId: string) => {
    patchVideoClip(selectedId, {
      effects: clip.effects.filter((e) => e.id !== effectId),
    });
  };

  return (
    <div className="flex flex-col p-4 border-b border-[var(--s-border)] animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[9px] text-[var(--s-accent)] mb-0.5">
            Video Track
          </p>
          <h3 className="text-[13px] font-medium text-[var(--s-text)] truncate max-w-[180px]">
            {asset?.name ?? "Video Clip"}
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

      <div className="flex flex-col gap-6">
        <ClipTimingControls
          clipId={selectedId}
          trackStart={clip.trackStart}
          duration={clip.duration}
          speed={clip.speed ?? 1}
        />

        {/* Transform Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Maximize size={12} className="text-[var(--s-text-subtle)]" />
            <h4 className="text-[11px] font-medium text-[var(--s-text-muted)]">Transform</h4>
          </div>
          <div className="flex flex-col gap-3">
            <SliderRow
              label="Zoom / Scale"
              min={0.1}
              max={5}
              step={0.01}
              value={clip.transform.scale}
              unit="x"
              onChange={(v) =>
                patchVideoClip(selectedId, { transform: { ...clip.transform, scale: v } })
              }
            />
            <SliderRow
              label="Rotation"
              min={-180}
              max={180}
              step={1}
              value={clip.transform.rotation}
              unit="°"
              onChange={(v) =>
                patchVideoClip(selectedId, { transform: { ...clip.transform, rotation: v } })
              }
            />
            <div className="grid grid-cols-2 gap-2">
              <SliderRow
                label="Pos X"
                min={-1}
                max={1}
                step={0.01}
                value={clip.transform.x}
                onChange={(v) =>
                  patchVideoClip(selectedId, { transform: { ...clip.transform, x: v } })
                }
              />
              <SliderRow
                label="Pos Y"
                min={-1}
                max={1}
                step={0.01}
                value={clip.transform.y}
                onChange={(v) =>
                  patchVideoClip(selectedId, { transform: { ...clip.transform, y: v } })
                }
              />
            </div>
          </div>
        </div>

        {/* Opacity Section */}
        <div>
          <SliderRow
            label="Opacity"
            min={0}
            max={100}
            step={1}
            value={Math.round(clip.opacity * 100)}
            unit="%"
            onChange={(v) => patchVideoClip(selectedId, { opacity: v / 100 })}
          />
        </div>

        {/* Fade Section */}
        <div className="flex flex-col gap-3">
          <h4 className="text-[11px] font-medium text-[var(--s-text-muted)]">Fade</h4>
          <SliderRow
            label="Fade In"
            min={0}
            max={maxFadeForClip(clip.duration)}
            step={CLIP_FADE_STEP_SECONDS}
            value={Math.round((clip.fadeIn ?? 0) * 100) / 100}
            unit="s"
            onChange={(v) => setClipFade(selectedId, "fadeIn", v)}
          />
          <SliderRow
            label="Fade Out"
            min={0}
            max={maxFadeForClip(clip.duration)}
            step={CLIP_FADE_STEP_SECONDS}
            value={Math.round((clip.fadeOut ?? 0) * 100) / 100}
            unit="s"
            onChange={(v) => setClipFade(selectedId, "fadeOut", v)}
          />
        </div>

        {/* Audio Section */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Volume2 size={12} className="text-[var(--s-text-subtle)]" />
            <h4 className="text-[11px] font-medium text-[var(--s-text-muted)]">Audio</h4>
          </div>
          <Toggle
            label="Mute clip audio"
            active={clip.audioMuted ?? false}
            onClick={() =>
              patchVideoClip(selectedId, { audioMuted: !(clip.audioMuted ?? false) })
            }
          />
          <button
            onClick={() =>
              clip.linkedClipId
                ? unlinkClip(selectedId)
                : detachClipAudio(selectedId)
            }
            className="px-2 py-1.5 rounded-md border border-[var(--s-border)] text-[10px] text-[var(--s-text-muted)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input)] transition-colors"
          >
            {clip.linkedClipId ? "Unlink audio" : "Detach audio to track"}
          </button>
          <SliderRow
            label="Volume"
            min={0}
            max={100}
            step={1}
            value={Math.round((clip.audioVolume ?? 1) * 100)}
            unit="%"
            onChange={(v) => patchVideoClip(selectedId, { audioVolume: v / 100 })}
          />
          <EqControls
            eq={clip.eq}
            onChange={(eq) => patchVideoClip(selectedId, { eq })}
          />
        </div>

        {/* Effects Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Plus size={12} className="text-[var(--s-text-subtle)]" />
              <h4 className="text-[11px] font-medium text-[var(--s-text-muted)]">
                Effects & Filters
              </h4>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {clip.effects.map((fx) => (
              <div
                key={fx.id}
                className="p-3 rounded-lg bg-white/5 border border-white/5"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px]   text-zinc-400    ">
                    {fx.mode}
                  </span>
                  <button
                    onClick={() => removeEffect(fx.id)}
                    className="text-zinc-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
                {/* Basic adjustment sliders for every effect (common ctx) */}
                <div className="flex flex-col gap-2">
                  <SliderRow
                    label="Intensity"
                    min={0}
                    max={2}
                    step={0.01}
                    value={fx.params.contrast ?? 1}
                    onChange={(v) => {
                      const newEffects = clip.effects.map((e) =>
                        e.id === fx.id
                          ? { ...e, params: { ...e.params, contrast: v } }
                          : e,
                      );
                      patchVideoClip(selectedId, { effects: newEffects });
                    }}
                  />
                </div>
              </div>
            ))}

            <div className="grid grid-cols-2 gap-1 mt-2">
              {EFFECT_MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => addEffect(mode.id)}
                  className="px-2 py-1.5 rounded-md border border-white/10 text-[9px]   text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
                >
                  + {mode.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
