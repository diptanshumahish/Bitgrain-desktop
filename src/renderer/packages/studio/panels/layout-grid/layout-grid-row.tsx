import React from "react";
import { Eye, EyeOff, Minus } from "lucide-react";
import type { LayoutGrid, LayoutGridKind } from "@bitgrain/studio-core/model/layout-grid-types";
import { ColorPicker } from "../../ui/ColorPicker";
import { ScrubField, SmallBtn } from "@bitgrain/ui/controls/panel/panelPrimitives";
import { SegmentedChoice } from "../../workspace-panel/segmented-choice";
import { LAYOUT_GRID_KIND_OPTIONS } from "./layout-grid-options";

interface LayoutGridRowProps {
  grid: LayoutGrid;
  onChange: (patch: Partial<LayoutGrid>) => void;
  onRemove: () => void;
}

const ICON_SIZE = 12;
const MAX_COUNT = 48;
const MAX_SPACING = 1000;
const MIN_SQUARE_SIZE = 2;

export const LayoutGridRow: React.FC<LayoutGridRowProps> = ({ grid, onChange, onRemove }) => (
  <div className="flex flex-col gap-2 pb-2 border-b border-[var(--s-border)] last:border-b-0">
    <div className="flex items-center gap-1.5">
      <div className="flex-1">
        <SegmentedChoice
          label="Grid type"
          iconOnly
          options={LAYOUT_GRID_KIND_OPTIONS}
          value={grid.kind}
          onChange={(value) => onChange({ kind: value as LayoutGridKind })}
        />
      </div>
      <SmallBtn title={grid.visible ? "Hide grid" : "Show grid"} onClick={() => onChange({ visible: !grid.visible })}>
        {grid.visible ? <Eye size={ICON_SIZE} /> : <EyeOff size={ICON_SIZE} />}
      </SmallBtn>
      <SmallBtn title="Remove grid" onClick={onRemove}>
        <Minus size={ICON_SIZE} />
      </SmallBtn>
    </div>
    {grid.kind === "grid" ? (
      <ScrubField label="Size" value={grid.size} min={MIN_SQUARE_SIZE} max={MAX_SPACING} onChange={(size) => onChange({ size })} />
    ) : (
      <div className="grid grid-cols-3 gap-1.5">
        <ScrubField label="N" title={grid.kind === "rows" ? "Number of rows" : "Number of columns"} compact value={grid.count} min={1} max={MAX_COUNT} onChange={(count) => onChange({ count: Math.round(count) })} />
        <ScrubField label="Gap" title="Space between them" compact value={grid.gutter} min={0} max={MAX_SPACING} onChange={(gutter) => onChange({ gutter })} />
        <ScrubField label="M" title="Margin from the page edge" compact value={grid.margin} min={0} max={MAX_SPACING} onChange={(margin) => onChange({ margin })} />
      </div>
    )}
    <ColorPicker color={grid.color} onChange={(color) => onChange({ color })} />
  </div>
);
