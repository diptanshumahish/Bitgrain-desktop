import React from "react";
import { PenTool, Pencil, Brush, ChevronDown } from "lucide-react";
import { emitPopover } from "@bitgrain/ui/overlays/popover-events";
import { Tooltip } from "@bitgrain/ui/controls/panel/Tooltip";
import { ToolTileContent } from "./tool-tile";
import { TOOL_SEGMENT_CLASS, TOOL_TILE_CLASS, TOOL_TILE_ICON_SIZE, toolTileTone } from "./tool-tile-styles";

interface DrawingOption {
  key: "pen" | "pencil" | "brush";
  label: string;
  shortcut: string;
  icon: React.ReactNode;
  active: boolean;
  onPick: () => void;
}

const DrawingFlyout: React.FC<{ options: DrawingOption[] }> = ({ options }) => (
  <div className="flex flex-col gap-0.5 rounded-xl border border-[var(--s-border)] bg-[var(--s-bg-panel)] p-1.5 min-w-[160px]">
    {options.map((option) => (
      <button
        key={option.key}
        type="button"
        onClick={option.onPick}
        aria-label={option.label}
        className={`flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[12px] font-medium transition-colors ${
          option.active
            ? "bg-[var(--s-bg-input)] text-[var(--s-text)]"
            : "bg-transparent text-[var(--s-text)] hover:bg-[var(--s-bg-input)]"
        }`}
      >
        {option.icon}
        <span className="flex-1 text-left">{option.label}</span>
        <span className="text-[12px] text-[var(--s-text-subtle)]">{option.shortcut}</span>
      </button>
    ))}
  </div>
);

interface DrawingToolButtonProps {
  penMode: boolean;
  pencilMode: boolean;
  brushMode: boolean;
  onSelectPen: () => void;
  onSelectPencil: () => void;
  onSelectBrush: () => void;
  onExit: () => void;
}

export const DrawingToolButton: React.FC<DrawingToolButtonProps> = ({
  penMode,
  pencilMode,
  brushMode,
  onSelectPen,
  onSelectPencil,
  onSelectBrush,
  onExit,
}) => {
  const isDrawing = penMode || pencilMode || brushMode;
  const CurrentIcon = brushMode ? Brush : pencilMode ? Pencil : PenTool;
  const primaryLabel = brushMode
    ? "Brush (B)"
    : pencilMode
    ? "Pencil (⇧P)"
    : "Pen (P)";

  const options: DrawingOption[] = [
    {
      key: "pen",
      label: "Pen",
      shortcut: "P",
      icon: <PenTool size={13} strokeWidth={1.75} />,
      active: penMode,
      onPick: () => {
        onSelectPen();
        emitPopover(null);
      },
    },
    {
      key: "pencil",
      label: "Pencil",
      shortcut: "⇧P",
      icon: <Pencil size={13} strokeWidth={1.75} />,
      active: pencilMode,
      onPick: () => {
        onSelectPencil();
        emitPopover(null);
      },
    },
    {
      key: "brush",
      label: "Brush",
      shortcut: "B",
      icon: <Brush size={13} strokeWidth={1.75} />,
      active: brushMode,
      onPick: () => {
        onSelectBrush();
        emitPopover(null);
      },
    },
  ];

  const toggleOrSelect = (): void => {
    if (isDrawing) onExit();
    else onSelectPen();
  };

  const openFlyout = (event: React.MouseEvent<HTMLButtonElement>): void => {
    emitPopover({
      type: "tool-dropdown",
      anchorRect: event.currentTarget.getBoundingClientRect(),
      content: <DrawingFlyout options={options} />,
    });
  };

  return (
    <div className="flex items-stretch rounded-xl overflow-hidden">
      <Tooltip content={isDrawing ? "Exit draw tool" : primaryLabel}>
        <button
          type="button"
          onClick={toggleOrSelect}
          aria-label={isDrawing ? "Exit draw tool" : primaryLabel}
          className={`${TOOL_TILE_CLASS} ${toolTileTone(isDrawing)}`}
        >
          <ToolTileContent icon={<CurrentIcon size={TOOL_TILE_ICON_SIZE} strokeWidth={1.75} />} label="Draw" />
        </button>
      </Tooltip>
      <div
        aria-hidden
        className={`w-px ${isDrawing ? "bg-white/15" : "bg-[var(--s-border)]"}`}
      />
      <button
        type="button"
        onClick={openFlyout}
        aria-label="More drawing tools"
        title="More drawing tools"
        className={`${TOOL_SEGMENT_CLASS} w-5 ${toolTileTone(isDrawing)}`}
      >
        <ChevronDown size={10} strokeWidth={1.75} />
      </button>
    </div>
  );
};
