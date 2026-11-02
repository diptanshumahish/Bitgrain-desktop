import React from "react";
import { ChevronDown, Circle, Square, Triangle } from "lucide-react";
import type { ShapeType } from "@bitgrain/studio-core/model/studio-types";
import { emitPopover } from "@bitgrain/ui/overlays/popover-events";
import { Tooltip } from "@bitgrain/ui/controls/panel/Tooltip";
import { ToolTileContent } from "./tool-tile";
import { TOOL_SEGMENT_CLASS, TOOL_TILE_CLASS, TOOL_TILE_ICON_SIZE, toolTileTone } from "./tool-tile-styles";

interface ShapeToolButtonProps {
  active: boolean;
  onAddRectangle: () => void;
  onStartShapePlacement: (type: ShapeType) => void;
}

interface ShapeOption {
  type: ShapeType;
  label: string;
  icon: React.ReactNode;
}

const SHAPE_OPTIONS: ShapeOption[] = [
  { type: "rect", label: "Rectangle", icon: <Square size={15} /> },
  { type: "circle", label: "Ellipse", icon: <Circle size={15} /> },
  { type: "triangle", label: "Triangle", icon: <Triangle size={15} /> },
];

const ShapeFlyout: React.FC<{ onPick: (type: ShapeType) => void }> = ({ onPick }) => (
  <div className="flex flex-col gap-0.5 rounded-xl border border-[var(--s-border)] bg-[var(--s-bg-panel)] p-1.5 min-w-[170px]">
    <span className="px-2 pt-1 pb-1.5 text-[12px] text-[var(--s-text-subtle)]">Click to place, or drag to draw</span>
    {SHAPE_OPTIONS.map((option) => (
      <button
        key={option.type}
        type="button"
        aria-label={`Draw ${option.label.toLowerCase()}`}
        onClick={() => onPick(option.type)}
        className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[12px] text-[var(--s-text)] hover:bg-[var(--s-bg-input)]"
      >
        {option.icon}
        {option.label}
      </button>
    ))}
  </div>
);

export const ShapeToolButton: React.FC<ShapeToolButtonProps> = ({ active, onAddRectangle, onStartShapePlacement }) => {
  const openFlyout = (event: React.MouseEvent<HTMLButtonElement>): void => {
    emitPopover({
      type: "tool-dropdown",
      anchorRect: event.currentTarget.getBoundingClientRect(),
      content: (
        <ShapeFlyout
          onPick={(type) => {
            onStartShapePlacement(type);
            emitPopover(null);
          }}
        />
      ),
    });
  };

  return (
    <div className="flex items-stretch rounded-xl overflow-hidden">
      <Tooltip content="Add rectangle (R)">
        <button
          type="button"
          aria-label="Add rectangle"
          onClick={onAddRectangle}
          className={`${TOOL_TILE_CLASS} ${toolTileTone(active)}`}
        >
          <ToolTileContent icon={<Square size={TOOL_TILE_ICON_SIZE} strokeWidth={1.75} />} label="Shape" />
        </button>
      </Tooltip>
      <div
        aria-hidden
        className={`w-px ${active ? "bg-white/15" : "bg-[var(--s-border)]"}`}
      />
      <button
        type="button"
        aria-label="More shapes"
        title="More shapes"
        onClick={openFlyout}
        className={`${TOOL_SEGMENT_CLASS} w-5 ${toolTileTone(active)}`}
      >
        <ChevronDown size={10} strokeWidth={1.75} />
      </button>
    </div>
  );
};
