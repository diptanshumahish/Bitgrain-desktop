import React from "react";
import { Plus, RotateCcw, Trash2, X } from "lucide-react";
import {
  currentProjectSignal,
  selectedClipIdSignal,
} from "../../store/project-store";
import { useSignalValue } from "../../../../lib/signal";
import { currentTimeSignal } from "../../store/timeline-store";
import {
  findFxClip,
  resetEffect,
  updateEffectMode,
  updateEffectParams,
} from "../../utils/clip-edits/effect-clip-edits";
import { addEffectToClip, removeEffectFromClip } from "../../utils/timeline-actions";
import { EffectMenu } from "./effects/effect-menu";
import { emitPopover } from "../../../../lib/event-bus";
import type { EffectApplication, EffectClip, EffectParams } from "../../types";
import { SliderRow } from "./effects/SliderRow";
import { TransformSection } from "./effects/TransformSection";
import { FilterParams } from "./effects/FilterParams";
import { ModePicker } from "./effects/ModePicker";
import { applyKeyframes } from "../../engine/processing/effect-params";

interface EffectCardProps {
  fx: EffectApplication;
  clip: EffectClip;
  selectedId: string;
  localTime: number;
  index: number;
}

const EffectCard: React.FC<EffectCardProps> = ({
  fx,
  clip,
  selectedId,
  localTime,
  index,
}) => {
  const onChange = (patch: Partial<EffectParams>) =>
    updateEffectParams(selectedId, fx.id, patch);
  const resolvedFx: EffectApplication = {
    ...fx,
    params: applyKeyframes(fx.params, clip.keyframes, localTime),
  };

  return (
    <div className="px-4 py-3.5 border-b border-[var(--s-border)]">
      <div className="flex items-center gap-2 mb-3.5">
        <span
          aria-hidden
          className="shrink-0 font-mono text-[10px] leading-none text-[var(--s-text-subtle)] tabular-nums"
        >
          [ {String(index + 1).padStart(2, "0")} ]
        </span>
        <div className="flex-1 min-w-0">
          <ModePicker
            value={fx.mode}
            onChange={(mode) => updateEffectMode(selectedId, fx.id, mode)}
            className="w-full"
          />
        </div>
        <button
          onClick={() => resetEffect(selectedId, fx.id, fx.mode)}
          aria-label="Reset effect"
          className="shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-[var(--s-text-subtle)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input)] transition-colors"
        >
          <RotateCcw size={13} />
        </button>
        <button
          onClick={() => removeEffectFromClip(selectedId, fx.id)}
          aria-label="Remove effect"
          className="shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-[var(--s-text-subtle)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input)] transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {fx.mode === "transform" && (
          <TransformSection
            fx={fx}
            clip={clip}
            localTime={localTime}
            onChange={onChange}
          />
        )}
        {fx.mode !== "transform" && (
          <FilterParams fx={resolvedFx} onChange={onChange} />
        )}
        {fx.mode !== "transform" && (
          <div className="flex flex-col gap-3 pt-3.5 border-t border-[var(--s-border)]">
            <span className="font-mono text-[9px] leading-none text-[var(--s-text-subtle)]">
              tone
            </span>
            <SliderRow
              label="Brightness"
              min={0}
              max={2}
              step={0.01}
              value={resolvedFx.params.brightness ?? 1}
              onChange={(v) => onChange({ brightness: v })}
            />
            <SliderRow
              label="Contrast"
              min={0}
              max={2}
              step={0.01}
              value={resolvedFx.params.contrast ?? 1}
              onChange={(v) => onChange({ contrast: v })}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const InspectorHeader: React.FC<{ clipId: string; count: number }> = ({
  clipId,
  count,
}) => {
  const openMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    emitPopover({
      type: "tool-dropdown",
      anchorRect: event.currentTarget.getBoundingClientRect(),
      content: (
        <EffectMenu
          onPick={(mode) => {
            addEffectToClip(clipId, mode);
            emitPopover(null);
          }}
        />
      ),
    });
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--s-border)]">
      <div className="flex items-baseline gap-2">
        <span className="text-[12px] font-medium text-[var(--s-text)]">effects</span>
        <span className="font-mono text-[10px] text-[var(--s-text-subtle)] tabular-nums">
          [ {count} ]
        </span>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={openMenu}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] text-[var(--s-text-muted)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input)] transition-colors"
        >
          <Plus size={13} strokeWidth={2} />
          add effect
        </button>
        <button
          onClick={() => (selectedClipIdSignal.value = null)}
          aria-label="Close effect inspector"
          className="w-7 h-7 rounded-md flex items-center justify-center text-[var(--s-text-subtle)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input)] transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

export const EffectInspector: React.FC = () => {
  const project = useSignalValue(currentProjectSignal);
  const selectedId = useSignalValue(selectedClipIdSignal);
  const time = useSignalValue(currentTimeSignal);
  if (!project || !selectedId) return null;

  const found = findFxClip(project, selectedId);
  if (!found) return null;

  const clip = found.clip;
  const localTime = time - clip.trackStart;

  return (
    <div className="flex flex-col animate-in slide-in-from-right duration-300">
      <InspectorHeader clipId={selectedId} count={clip.effects.length} />
      {clip.effects.map((fx, index) => (
        <EffectCard
          key={fx.id}
          fx={fx}
          clip={clip}
          selectedId={selectedId}
          localTime={localTime}
          index={index}
        />
      ))}
    </div>
  );
};
