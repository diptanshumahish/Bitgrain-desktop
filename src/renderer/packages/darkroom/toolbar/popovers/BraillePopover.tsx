import React from "react";
import { Popover, PopoverSection } from "@bitgrain/ui/controls/toolbar/Popover";
import { Slider } from "@bitgrain/ui/controls/toolbar/slider";
import { EditableValue } from "@bitgrain/ui/controls/toolbar/editable-value";
import { ToggleRow } from "@bitgrain/ui/controls/toolbar/controls/ToggleRow";

interface BraillePopoverProps {
  density: number;
  setDensity: (v: number) => void;
  isColor: boolean;
  toggleColor: () => void;
  onStateChangeFinished: () => void;
  onClose: () => void;
  static?: boolean;
}


export const BraillePopover: React.FC<BraillePopoverProps> = ({
  density,
  setDensity,
  isColor,
  toggleColor,
  onStateChangeFinished,
  onClose,
  static: isStatic,
}) => (
  <Popover onClose={onClose} className="w-52" static={isStatic}>
    <PopoverSection title="Detail">
      <div className="grid grid-cols-[1fr_28px] items-center gap-x-2 px-1">
        <Slider
          label="Detail"
          min={0.4}
          max={2.5}
          step={0.1}
          value={density}
          onChange={setDensity}
          onDone={onStateChangeFinished}
        />
        <EditableValue
          value={density}
          min={0.4}
          max={2.5}
          step={0.1}
          decimals={1}
          suffix="x"
          onChange={setDensity}
          onCommit={onStateChangeFinished}
        />
      </div>
    </PopoverSection>

    <div className="h-px bg-[var(--s-border)] opacity-50" />
    <PopoverSection>
      <ToggleRow label="Source colour" hint="Keep the photo's own colours" checked={isColor} onChange={toggleColor} />
    </PopoverSection>
  </Popover>
);
