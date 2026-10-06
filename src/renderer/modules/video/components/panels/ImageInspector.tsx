import React from "react";
import { X, Image as ImageIcon, Wand2 } from "lucide-react";
import {
  currentProjectSignal,
  selectedClipIdSignal,
  updateProject,
} from "../../store/project-store";
import { useSignalValue } from "../../../../lib/signal";
import type { ImageClip, ImageTrack, OverlayFilters } from "../../types";
import { setClipFade } from "../../utils/clip-mutations";
import { maxFadeForClip } from "../../utils/clip-fade";
import { CLIP_FADE_STEP_SECONDS } from "../../constants";
import { SliderRow } from "./effects/SliderRow";
import { ImageEffectSection } from "./ImageEffectSection";
import { ClipTimingControls } from "./ClipTimingControls";

function findImageClip(
  clipId: string,
): { track: ImageTrack; clip: ImageClip } | null {
  const project = currentProjectSignal.value;
  if (!project) return null;
  for (const track of project.tracks) {
    if (track.kind !== "image") continue;
    const clip = track.clips.find((c) => c.id === clipId);
    if (clip) return { track, clip };
  }
  return null;
}

function patchImage(clipId: string, patch: Partial<ImageClip>): void {
  updateProject((project) => {
    const tracks = project.tracks.map((track) => {
      if (track.kind !== "image") return track;
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

export const ImageInspector: React.FC = () => {
  const project = useSignalValue(currentProjectSignal);
  const selectedId = useSignalValue(selectedClipIdSignal);
  if (!project || !selectedId) return null;

  const found = findImageClip(selectedId);
  if (!found) return null;
  const clip = found.clip;
  const asset = project.mediaPool.find((a) => a.id === clip.assetId);
  const filters = clip.filters ?? {};

  const patchFilters = (patch: Partial<OverlayFilters>) =>
    patchImage(selectedId, { filters: { ...filters, ...patch } });

  return (
    <div className="flex flex-col p-4 border-b border-[var(--s-border)] animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ImageIcon size={13} className="text-[var(--s-accent)]" />
          <div>
            <p className="text-[9px] text-[var(--s-accent)] mb-0.5">Image overlay</p>
            <h3 className="text-[13px] font-medium text-[var(--s-text)] truncate max-w-[160px]">
              {asset?.name ?? "Image"}
            </h3>
          </div>
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
        />
        <div className="flex flex-col gap-3">
          <h4 className="text-[11px] font-medium text-[var(--s-text-muted)]">Transform</h4>
          <SliderRow
            label="Size"
            min={0.1}
            max={4}
            step={0.01}
            unit="x"
            value={clip.scale}
            onChange={(v) => patchImage(selectedId, { scale: v })}
          />
          <SliderRow
            label="Rotation"
            min={-180}
            max={180}
            step={1}
            unit="°"
            value={clip.rotation}
            onChange={(v) => patchImage(selectedId, { rotation: v })}
          />
          <div className="grid grid-cols-2 gap-2">
            <SliderRow
              label="Pos X"
              min={0}
              max={100}
              step={1}
              unit="%"
              value={Math.round(clip.position.x * 100)}
              onChange={(v) =>
                patchImage(selectedId, { position: { ...clip.position, x: v / 100 } })
              }
            />
            <SliderRow
              label="Pos Y"
              min={0}
              max={100}
              step={1}
              unit="%"
              value={Math.round(clip.position.y * 100)}
              onChange={(v) =>
                patchImage(selectedId, { position: { ...clip.position, y: v / 100 } })
              }
            />
          </div>
          <SliderRow
            label="Opacity"
            min={0}
            max={100}
            step={1}
            unit="%"
            value={Math.round(clip.opacity * 100)}
            onChange={(v) => patchImage(selectedId, { opacity: v / 100 })}
          />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Wand2 size={12} className="text-[var(--s-text-subtle)]" />
            <h4 className="text-[11px] font-medium text-[var(--s-text-muted)]">Effects</h4>
          </div>
          <SliderRow
            label="Blur"
            min={0}
            max={20}
            step={0.5}
            unit="px"
            value={filters.blur ?? 0}
            onChange={(v) => patchFilters({ blur: v })}
          />
          <SliderRow
            label="Grayscale"
            min={0}
            max={100}
            step={1}
            unit="%"
            value={Math.round((filters.grayscale ?? 0) * 100)}
            onChange={(v) => patchFilters({ grayscale: v / 100 })}
          />
          <SliderRow
            label="Invert"
            min={0}
            max={100}
            step={1}
            unit="%"
            value={Math.round((filters.invert ?? 0) * 100)}
            onChange={(v) => patchFilters({ invert: v / 100 })}
          />
          <SliderRow
            label="Sepia"
            min={0}
            max={100}
            step={1}
            unit="%"
            value={Math.round((filters.sepia ?? 0) * 100)}
            onChange={(v) => patchFilters({ sepia: v / 100 })}
          />
          <SliderRow
            label="Hue"
            min={0}
            max={360}
            step={1}
            unit="°"
            value={filters.hueRotate ?? 0}
            onChange={(v) => patchFilters({ hueRotate: v })}
          />
          <SliderRow
            label="Saturation"
            min={0}
            max={300}
            step={1}
            unit="%"
            value={Math.round((filters.saturate ?? 1) * 100)}
            onChange={(v) => patchFilters({ saturate: v / 100 })}
          />
          <SliderRow
            label="Brightness"
            min={0}
            max={200}
            step={1}
            unit="%"
            value={Math.round((filters.brightness ?? 1) * 100)}
            onChange={(v) => patchFilters({ brightness: v / 100 })}
          />
          <SliderRow
            label="Contrast"
            min={0}
            max={200}
            step={1}
            unit="%"
            value={Math.round((filters.contrast ?? 1) * 100)}
            onChange={(v) => patchFilters({ contrast: v / 100 })}
          />
        </div>

        <ImageEffectSection
          effect={clip.effect}
          onChange={(effect) => patchImage(selectedId, { effect })}
        />

        <div className="flex flex-col gap-3">
          <h4 className="text-[11px] font-medium text-[var(--s-text-muted)]">Fade</h4>
          <SliderRow
            label="Fade In"
            min={0}
            max={maxFadeForClip(clip.duration)}
            step={CLIP_FADE_STEP_SECONDS}
            unit="s"
            value={Math.round((clip.fadeIn ?? 0) * 100) / 100}
            onChange={(v) => setClipFade(selectedId, "fadeIn", v)}
          />
          <SliderRow
            label="Fade Out"
            min={0}
            max={maxFadeForClip(clip.duration)}
            step={CLIP_FADE_STEP_SECONDS}
            unit="s"
            value={Math.round((clip.fadeOut ?? 0) * 100) / 100}
            onChange={(v) => setClipFade(selectedId, "fadeOut", v)}
          />
        </div>
      </div>
    </div>
  );
};
