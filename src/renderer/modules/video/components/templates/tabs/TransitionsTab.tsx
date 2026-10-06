import React from "react";
import { TRANSITION_PRESETS } from "../../../templates/transitions";
import { applyTransitionToSelected } from "../../../templates/apply-transition";
import { emitPopover } from "../../../../../lib/event-bus";
import { useSignalValue } from "../../../../../lib/signal";
import { selectedClipIdSignal } from "../../../store/project-store";
import { TransitionPreview } from "../previews/TransitionPreview";

export const TransitionsTab: React.FC = () => {
  const selectedId = useSignalValue(selectedClipIdSignal);
  const hasSelection = !!selectedId;

  return (
    <div className="flex flex-col gap-1.5 p-1">
      {!hasSelection && (
        <div className="px-2.5 py-2 rounded-md bg-[var(--s-bg-input)] text-[10.5px] text-[var(--s-text-subtle)] leading-snug">
          Select a clip first. Fades apply between it and the nearest previous
          clip on the same track.
        </div>
      )}
      {TRANSITION_PRESETS.map((preset) => (
        <button
          key={preset.id}
          type="button"
          disabled={!hasSelection}
          onClick={() => {
            const ok = applyTransitionToSelected(preset.id, preset.duration);
            if (ok) emitPopover(null);
          }}
          className="flex flex-col items-stretch gap-1.5 px-2 py-2 rounded-lg border border-[var(--s-border)] bg-[var(--s-bg-input)] hover:bg-[var(--s-bg-input-hover)] disabled:opacity-40 disabled:cursor-not-allowed text-left transition-colors"
        >
          <TransitionPreview kind={preset.id} />
          <div className="flex items-baseline justify-between w-full gap-2">
            <span className="text-[11.5px] text-[var(--s-text)] font-medium">
              {preset.label}
            </span>
            <span className="text-[9px] text-[var(--s-text-subtle)] font-mono">
              {preset.duration.toFixed(1)}s
            </span>
          </div>
          <span className="text-[10px] text-[var(--s-text-subtle)] leading-snug">
            {preset.description}
          </span>
        </button>
      ))}
    </div>
  );
};
