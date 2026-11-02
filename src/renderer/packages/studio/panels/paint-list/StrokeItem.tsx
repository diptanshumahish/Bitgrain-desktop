import React from "react";
import type { LayerStroke } from "@bitgrain/studio-core/model/layer-paint-types";
import type { StrokeAlign } from "@bitgrain/studio-core/model/paint-types";
import { ColorPicker } from "../../ui/ColorPicker";
import { BtnGroup, ScrubField } from "@bitgrain/ui/controls/panel/panelPrimitives";
import { ALIGN_CHOICES } from "../stroke/stroke-options";
import { PaintRowControls } from "./PaintRowControls";

const MAX_STROKE_WIDTH = 200;

interface StrokeItemProps {
  stroke: LayerStroke;
  index: number;
  count: number;
  showAlign: boolean;
  onChange: (stroke: LayerStroke) => void;
  onMove: (delta: number) => void;
  onRemove: () => void;
}

export const StrokeItem: React.FC<StrokeItemProps> = ({ stroke, index, count, showAlign, onChange, onMove, onRemove }) => (
  <div className={`flex flex-col gap-2 rounded-lg border border-[var(--s-border)] p-2 ${stroke.visible ? "" : "opacity-50"}`}>
    <div className="flex items-center gap-1.5">
      <div className="flex-1 min-w-0">
        <ColorPicker color={stroke.color} onChange={(color) => onChange({ ...stroke, color })} />
      </div>
      <PaintRowControls
        visible={stroke.visible}
        canMoveUp={index < count - 1}
        canMoveDown={index > 0}
        onToggleVisible={() => onChange({ ...stroke, visible: !stroke.visible })}
        onMoveUp={() => onMove(1)}
        onMoveDown={() => onMove(-1)}
        onRemove={onRemove}
      />
    </div>
    <div className={showAlign ? "grid grid-cols-[72px_minmax(0,1fr)] gap-2" : "grid grid-cols-1"}>
      <ScrubField label="W" value={stroke.width} min={0} max={MAX_STROKE_WIDTH} onChange={(width) => onChange({ ...stroke, width })} />
      {showAlign && (
        <BtnGroup options={ALIGN_CHOICES} value={stroke.align} onChange={(align) => onChange({ ...stroke, align: align as StrokeAlign })} />
      )}
    </div>
  </div>
);
