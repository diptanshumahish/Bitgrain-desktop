import React from "react";
import { ChevronDown, Circle, Square, Triangle } from "lucide-react";
import type { ShapeType } from "../../../data/studioTypes";
import { emitPopover } from "../../../lib/event-bus";
import { Tooltip } from "../ui/Tooltip";

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

const SEGMENT_BASE =
  "h-9 flex items-center justify-center border-none outline-none cursor-pointer transition-colors";

const segmentTone = (active: boolean): string =>
  active
    ? "bg-[var(--s-accent)] text-[var(--s-accent-text)]"
    : "bg-transparent text-[var(--s-text)] hover:bg-[var(--s-bg-input)]";

const ShapeFlyout: React.FC<{ onPick: (type: ShapeType) => void }> = ({ onPick }) => (
  <div className="flex flex-col gap-0.5 rounded-xl border border-[var(--s-border)] bg-[var(--s-bg-panel)] p-1.5 min-w-[170px]">
    <span className="px-2 pt-1 pb-1.5 text-[10.5px] text-[var(--s-text-subtle)]">Click to place, or drag to draw</span>
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
    <div className="flex items-center">
      <Tooltip content="Add rectangle (R)">
        <button
          type="button"
          aria-label="Add rectangle"
          onClick={onAddRectangle}
          className={`${SEGMENT_BASE} w-8 rounded-l-xl ${segmentTone(active)}`}
        >
          <Square size={16} strokeWidth={1.5} />
        </button>
      </Tooltip>
      <button
        type="button"
        aria-label="More shapes"
        title="More shapes"
        onClick={openFlyout}
        className={`${SEGMENT_BASE} w-5 rounded-r-xl ${segmentTone(active)}`}
      >
        <ChevronDown size={10} strokeWidth={1.5} />
      </button>
    </div>
  );
};
