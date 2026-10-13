import React from "react";
import type { ColorGrade } from "../engine/grade-types";
import type { MaskLayer } from "../mask/mask-types";
import { createMaskLayer } from "../mask/mask-defaults";
import { GradeControls } from "../ui/GradeControls";
import { ScopeBar } from "./scope-bar";
import { MaskSettings, type MaskOverlayToggle } from "./MaskSettings";
import { trackEvent } from "../../../lib/tracker";

interface ScopedGradePanelProps {
  grade: ColorGrade | undefined;
  masks: MaskLayer[] | undefined;
  selectedId: string | null;
  sourceUrl: string | null;
  hasEffect: boolean;
  overlay?: MaskOverlayToggle;
  onGradeChange: (grade: ColorGrade) => void;
  onMasksChange: (masks: MaskLayer[]) => void;
  onSelect: (id: string | null) => void;
  onCommit?: () => void;
}

export const ScopedGradePanel: React.FC<ScopedGradePanelProps> = ({
  grade, masks = [], selectedId, sourceUrl, hasEffect, overlay,
  onGradeChange, onMasksChange, onSelect, onCommit,
}) => {
  const selected = masks.find((mask) => mask.id === selectedId) ?? null;

  const addMask = (): void => {
    const mask = createMaskLayer(masks);
    onMasksChange([...masks, mask]);
    onSelect(mask.id);
    onCommit?.();
    trackEvent("grading", "mask_added", { details: { mask_count: masks.length + 1 } });
  };

  const replaceMask = (next: MaskLayer): void => onMasksChange(masks.map((mask) => (mask.id === next.id ? next : mask)));

  const deleteMask = (id: string): void => {
    onMasksChange(masks.filter((mask) => mask.id !== id));
    onSelect(null);
    onCommit?.();
    trackEvent("grading", "mask_deleted", { details: { mask_count: masks.length - 1 } });
  };

  return (
    <div className="flex flex-col gap-4">
      <ScopeBar masks={masks} selectedId={selected?.id ?? null} onSelect={onSelect} onAdd={addMask} />
      {selected && (
        <MaskSettings
          mask={selected}
          sourceUrl={sourceUrl}
          hasEffect={hasEffect}
          overlay={overlay}
          onChange={replaceMask}
          onDelete={() => deleteMask(selected.id)}
          onCommit={onCommit}
        />
      )}
      <div className="flex flex-col">
        {masks.length > 0 && (
          <span className={`text-[12px] font-medium pb-1 ${selected ? "text-[var(--s-accent)]" : "text-[var(--s-text-muted)]"}`}>
            {selected ? `adjustments for ${selected.name} only` : "adjustments for the whole photo"}
          </span>
        )}
        {selected ? (
          <GradeControls key={selected.id} grade={selected.grade} onChange={(next) => replaceMask({ ...selected, grade: next })} onCommit={onCommit} />
        ) : (
          <GradeControls key="whole-photo" grade={grade} onChange={onGradeChange} onCommit={onCommit} />
        )}
      </div>
    </div>
  );
};
