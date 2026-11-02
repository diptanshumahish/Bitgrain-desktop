import React from "react";
import { Slider } from "@bitgrain/ui/controls/panel/slider";
import { emitDarkroomModal } from "../../modals/darkroom-modal-events";
import type { MaskArea } from "@bitgrain/engine/grading/mask/mask-types";
import { AreaSummary } from "./area-summary";
import { ToggleRow } from "./refine/toggle-row";
import { LuminanceRangeControls } from "./refine/luminance-range-controls";
import { ColorRangeControls } from "./refine/color-range-controls";

interface MaskAreaControlsProps {
  area: MaskArea;
  sourceUrl: string | null;
  onChange: (area: MaskArea) => void;
  onCommit?: () => void;
}

const FEATHER_MAX = 100;

export const MaskAreaControls: React.FC<MaskAreaControlsProps> = ({ area, sourceUrl, onChange, onCommit }) => {
  const update = (patch: Partial<MaskArea>): void => onChange({ ...area, ...patch });

  const openAreaEditor = (): void => {
    if (!sourceUrl) return;
    emitDarkroomModal({
      type: "mask-area",
      source: sourceUrl,
      area: { brush: area.brush, shape: area.shape },
      onApply: (drawn) => {
        update(drawn);
        onCommit?.();
      },
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <AreaSummary area={area} canEdit={!!sourceUrl} onEdit={openAreaEditor} />
      <span className="text-[11px] text-[var(--s-text-subtle)]">Narrow it down</span>
      <LuminanceRangeControls range={area.luminance} onChange={(luminance) => update({ luminance })} onCommit={onCommit} />
      <ColorRangeControls range={area.color} onChange={(color) => update({ color })} onCommit={onCommit} />
      <ToggleRow
        label="Invert"
        value={area.invert}
        onChange={(invert) => {
          update({ invert });
          onCommit?.();
        }}
      />
      <Slider label="Feather" value={area.feather} max={FEATHER_MAX} onChange={(feather) => update({ feather })} onCommit={onCommit} />
    </div>
  );
};
