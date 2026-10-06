import React from "react";
import type { VideoReelTemplate } from "../../../templates/reel-types";

interface ReelPreviewProps {
  template: VideoReelTemplate;
}

const EFFECT_LABEL: Record<string, string> = {
  vignette: "vignette",
  colorgrade: "grade",
  colorwash: "wash",
  scanlines: "scanlines",
  chromatic: "chroma",
  posterize: "posterize",
  sharpen: "sharpen",
  halftone: "halftone",
  duotone: "duotone",
  grain: "grain",
  "haze-bloom": "bloom",
};

function collectEffectLabels(template: VideoReelTemplate): string[] {
  const seen = new Set<string>();
  for (const band of template.fxBands) {
    for (const effect of band.effects) {
      const label = EFFECT_LABEL[effect.mode] ?? effect.mode;
      seen.add(label);
    }
  }
  return Array.from(seen).slice(0, 3);
}

export const ReelPreview: React.FC<ReelPreviewProps> = ({ template }) => {
  const totalDuration = Math.max(template.totalDuration, 0.001);
  const labels = collectEffectLabels(template);

  return (
    <div className="h-16 w-full rounded-md bg-black overflow-hidden flex flex-col gap-0.5 p-1" aria-hidden>
      <div className="relative h-4 rounded-sm bg-white/5 overflow-hidden">
        {template.slots.map((slot, idx) => {
          const left = (slot.trackStart / totalDuration) * 100;
          const width = Math.min(100 - left, (slot.duration / totalDuration) * 100);
          return (
            <div
              key={idx}
              className="absolute inset-y-0 bg-violet-500/80 border border-violet-300/40 rounded-sm flex items-center justify-center"
              style={{ left: `${left}%`, width: `${Math.max(2, width)}%` }}
            >
              <span className="text-[8px] text-white/80 font-mono">{idx + 1}</span>
            </div>
          );
        })}
      </div>
      <div className="relative h-2.5 rounded-sm bg-white/5 overflow-hidden">
        {template.overlays.map((overlay, idx) => {
          const left = (overlay.offset / totalDuration) * 100;
          const width = Math.min(100 - left, (overlay.duration / totalDuration) * 100);
          return (
            <div
              key={idx}
              className="absolute inset-y-0 bg-rose-400/80 rounded-sm"
              style={{ left: `${left}%`, width: `${Math.max(2, width)}%` }}
            />
          );
        })}
      </div>
      <div className="relative h-2 rounded-sm bg-white/5 overflow-hidden">
        {template.fxBands.map((band, idx) => {
          const left = (band.offset / totalDuration) * 100;
          const width = Math.min(100 - left, (band.duration / totalDuration) * 100);
          return (
            <div
              key={idx}
              className="absolute inset-y-0 bg-amber-400/80 rounded-sm"
              style={{ left: `${left}%`, width: `${Math.max(2, width)}%` }}
            />
          );
        })}
      </div>
      <div className="flex items-center gap-1 text-[8.5px] text-white/55 font-mono leading-none">
        <span>{template.totalDuration.toFixed(1)}s</span>
        <span className="text-white/30">·</span>
        <span>
          {template.minClips === template.maxClips
            ? `${template.minClips} clip${template.minClips === 1 ? "" : "s"}`
            : `${template.minClips}-${template.maxClips} clips`}
        </span>
        <span className="ml-auto truncate flex gap-1">
          {labels.map((label) => (
            <span key={label} className="px-1 py-px rounded bg-white/10 text-white/70">
              {label}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
};
