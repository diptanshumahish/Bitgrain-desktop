import React from "react";
import { Popover } from "@bitgrain/ui/controls/toolbar/Popover";
import type { TransformMode } from "@bitgrain/engine/core/types";
import { FILTER_ENTRIES } from "../filter-modes";
import { toggleStackedFilter, withoutMode } from "../effects/main-effect-modes";
import { pushHistory } from "../../state/history-store";
import { FilterRow } from "./filters/FilterRow";
import { FiltersHeader } from "./filters/FiltersHeader";

interface FiltersPopoverProps {
  mode: TransformMode[];
  setMode: (m: TransformMode[]) => void;
  onClose: () => void;
  static?: boolean;
}

export const FiltersPopover: React.FC<FiltersPopoverProps> = ({
  mode,
  setMode,
  onClose,
  static: isStatic,
}) => {
  const toggle = (id: TransformMode): void => {
    setMode(toggleStackedFilter(mode, id));
    pushHistory();
  };
  const activeIds = FILTER_ENTRIES.filter((entry) => mode.includes(entry.id)).map((entry) => entry.id);
  const clearAll = (): void => {
    setMode(activeIds.reduce(withoutMode, mode));
    pushHistory();
  };

  return (
    <Popover onClose={onClose} className="min-w-[220px]" static={isStatic}>
      <div className="p-2">
        <FiltersHeader activeCount={activeIds.length} onClearAll={clearAll} />
        <div className="flex flex-col gap-1">
          {FILTER_ENTRIES.map((entry) => (
            <FilterRow key={entry.id} entry={entry} active={mode.includes(entry.id)} onToggle={() => toggle(entry.id)} />
          ))}
        </div>
      </div>
    </Popover>
  );
};
