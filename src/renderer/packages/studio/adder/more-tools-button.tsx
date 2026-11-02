import React from "react";
import { Contrast, LayoutGrid, MoreHorizontal, Shirt } from "lucide-react";
import { emitPopover } from "@bitgrain/ui/overlays/popover-events";
import { MenuOptionRow } from "@bitgrain/ui/components/MenuOptionRow";
import { Tooltip } from "@bitgrain/ui/controls/panel/Tooltip";
import { ToolTileContent } from "./tool-tile";
import { TOOL_TILE_CLASS, TOOL_TILE_ICON_SIZE, toolTileTone } from "./tool-tile-styles";

interface MoreToolsButtonProps {
  onAddAdjustment: () => void;
  onAddPattern: () => void;
  onMockup: () => void;
}

interface MoreToolOption {
  key: string;
  label: string;
  detail: string;
  icon: React.ReactNode;
  onPick: () => void;
}

interface MoreToolsMenuProps {
  options: MoreToolOption[];
}

const MoreToolsMenu: React.FC<MoreToolsMenuProps> = ({ options }) => (
  <div className="flex flex-col gap-0.5 rounded-xl border border-[var(--s-border)] bg-[var(--s-bg-panel)] p-1.5 min-w-[240px]">
    {options.map((option) => (
      <MenuOptionRow key={option.key} label={option.label} detail={option.detail} icon={option.icon}
        onClick={() => { option.onPick(); emitPopover(null); }} />
    ))}
  </div>
);

export const MoreToolsButton: React.FC<MoreToolsButtonProps> = ({ onAddAdjustment, onAddPattern, onMockup }) => {
  const options: MoreToolOption[] = [
    { key: "adjustment", label: "Adjustment layer", detail: "Grade everything below it", icon: <Contrast size={TOOL_TILE_ICON_SIZE} strokeWidth={1.75} />, onPick: onAddAdjustment },
    { key: "pattern", label: "Pattern", detail: "Repeat a shape across the page", icon: <LayoutGrid size={TOOL_TILE_ICON_SIZE} strokeWidth={1.75} />, onPick: onAddPattern },
    { key: "mockup", label: "Mockup", detail: "Place your design on a photo", icon: <Shirt size={TOOL_TILE_ICON_SIZE} strokeWidth={1.75} />, onPick: onMockup },
  ];

  const openMenu = (event: React.MouseEvent<HTMLButtonElement>): void => {
    emitPopover({
      type: "tool-dropdown",
      anchorRect: event.currentTarget.getBoundingClientRect(),
      content: <MoreToolsMenu options={options} />,
    });
  };

  return (
    <Tooltip content="Adjustment layer, pattern, mockup">
      <button type="button" onClick={openMenu} aria-label="More tools" className={`${TOOL_TILE_CLASS} rounded-xl ${toolTileTone(false)}`}>
        <ToolTileContent icon={<MoreHorizontal size={TOOL_TILE_ICON_SIZE} strokeWidth={1.75} />} label="More" />
      </button>
    </Tooltip>
  );
};
