import React from "react";
import { Popover } from "../Popover";
import { EffectRowButton } from "./EffectRowButton";
import { buildEffectRows, EFFECT_GROUP_ORDER } from "./effect-rows";
import type { ToolbarState } from "../use-toolbar-state";
import type { ActivePopover } from "../DesktopToolbar";

interface EffectsPopoverProps {
  state: ToolbarState;
  onOpen: (key: ActivePopover) => void;
  onClose: () => void;
}

export const EffectsPopover: React.FC<EffectsPopoverProps> = ({ state, onOpen, onClose }) => {
  const rows = buildEffectRows(state, onOpen, onClose);
  return (
    <Popover onClose={onClose} className="w-64">
      <div className="max-h-[68vh] overflow-y-auto p-1.5">
        <p className="text-[14px] font-semibold text-[var(--s-text)] px-2 pt-1 pb-0.5">Pick a look</p>
        <p className="text-[12px] text-[var(--s-text-subtle)] px-2 pb-2">Your photo stays as it is until you pick one. Filters stack on top.</p>
        {EFFECT_GROUP_ORDER.map((group) => (
          <div key={group} className="mb-1 last:mb-0">
            <p className="text-[12px] font-medium text-[var(--s-text-subtle)] px-2 pb-1">{group}</p>
            <div className="flex flex-col gap-0.5">
              {rows.filter((row) => row.group === group).map((row) => <EffectRowButton key={row.key} row={row} />)}
            </div>
          </div>
        ))}
      </div>
    </Popover>
  );
};
