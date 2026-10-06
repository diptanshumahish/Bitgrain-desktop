import React, { useState, useCallback, useMemo } from "react";
import { ChevronLeft } from "lucide-react";
import { useSignalValue } from "../../../../../lib/signal";
import { currentProjectSignal } from "../../../store/project-store";
import { emitPopover } from "../../../../../lib/event-bus";
import type { MediaAsset } from "../../../types";
import type { VideoReelTemplate } from "../../../templates/reel-types";
import { applyReelTemplate } from "../../../templates/apply-reel";
import { ReelAssetTile } from "./ReelAssetTile";

interface ReelAssetPickerProps {
  template: VideoReelTemplate;
  onBack: () => void;
}

function filterAssets(template: VideoReelTemplate, pool: MediaAsset[]): MediaAsset[] {
  if (template.mediaKind === "video") {
    return pool.filter((a) => a.kind === "video");
  }
  if (template.mediaKind === "image") {
    return pool.filter((a) => a.kind === "image");
  }
  return pool.filter((a) => a.kind === "video" || a.kind === "image");
}

export const ReelAssetPicker: React.FC<ReelAssetPickerProps> = ({ template, onBack }) => {
  const project = useSignalValue(currentProjectSignal);
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const available = useMemo(
    () => (project ? filterAssets(template, project.mediaPool) : []),
    [project, template],
  );

  const toggle = useCallback(
    (id: string) => {
      setError(null);
      setSelected((prev) => {
        const idx = prev.indexOf(id);
        if (idx >= 0) return prev.filter((x) => x !== id);
        if (prev.length >= template.maxClips) return prev;
        return [...prev, id];
      });
    },
    [template.maxClips],
  );

  const onApply = useCallback(() => {
    const assets = selected
      .map((id) => available.find((a) => a.id === id))
      .filter((a): a is MediaAsset => !!a);
    const result = applyReelTemplate(template, assets);
    if (!result.ok) {
      setError(result.reason ?? "Could not apply template");
      return;
    }
    emitPopover(null);
  }, [available, selected, template]);

  const ready = selected.length >= template.minClips && selected.length <= template.maxClips;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-[var(--s-border)]">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to reels"
          className="w-6 h-6 rounded-md text-[var(--s-text-subtle)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input)] flex items-center justify-center transition-colors"
        >
          <ChevronLeft size={14} strokeWidth={1.75} />
        </button>
        <div className="flex flex-col min-w-0 leading-tight">
          <span className="text-[11.5px] text-[var(--s-text)] font-medium truncate">
            {template.label}
          </span>
          <span className="text-[9.5px] text-[var(--s-text-subtle)]">
            Pick {template.minClips === template.maxClips
              ? template.minClips
              : `${template.minClips}–${template.maxClips}`}{" "}
            {template.mediaKind === "image" ? "image" : "clip"}
            {template.minClips === 1 ? "" : "s"} in order
          </span>
        </div>
        <span className="ml-auto text-[10px] font-mono text-[var(--s-text-subtle)]">
          {selected.length}/{template.minClips}
        </span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-1.5">
        {available.length === 0 ? (
          <div className="px-2 py-4 text-[10.5px] text-[var(--s-text-subtle)] text-center leading-snug">
            No {template.mediaKind === "image" ? "image" : "video"} assets in your project.
            Import media first.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1.5">
            {available.map((asset) => {
              const idx = selected.indexOf(asset.id);
              return (
                <ReelAssetTile
                  key={asset.id}
                  asset={asset}
                  selectionIndex={idx >= 0 ? idx : null}
                  onToggle={() => toggle(asset.id)}
                />
              );
            })}
          </div>
        )}
      </div>

      {error && (
        <div className="px-2 py-1.5 text-[10px] text-red-400 border-t border-[var(--s-border)]">
          {error}
        </div>
      )}

      <div className="flex items-center gap-1.5 p-1.5 border-t border-[var(--s-border)]">
        <button
          type="button"
          onClick={() => setSelected([])}
          disabled={selected.length === 0}
          className="px-2.5 py-1.5 text-[10.5px] text-[var(--s-text-subtle)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input)] disabled:opacity-40 rounded-md transition-colors"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={onApply}
          disabled={!ready}
          className="flex-1 px-3 py-1.5 rounded-md bg-[var(--s-text)] text-[var(--s-bg-panel)] text-[11px] font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
        >
          Build reel
        </button>
      </div>
    </div>
  );
};
