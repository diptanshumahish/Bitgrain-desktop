import React from "react";
import { Popover, PopoverSection } from "../Popover";
import { Slider } from "../slider";
import { EditableValue } from "../editable-value";

interface BraillePopoverProps {
  density: number;
  setDensity: (v: number) => void;
  isColor: boolean;
  toggleColor: () => void;
  onStateChangeFinished: () => void;
  onClose: () => void;
  static?: boolean;
}

const optionClass = (active: boolean): string =>
  `px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
    active
      ? "bg-[var(--s-accent)] text-[var(--s-accent-text)]"
      : "text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)] hover:text-[var(--s-text)]"
  }`;

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
    <PopoverSection title="Color">
      <button onClick={toggleColor} className={`w-full ${optionClass(isColor)}`}>
        {isColor ? "Source color on" : "Source color off"}
      </button>
    </PopoverSection>
  </Popover>
);
