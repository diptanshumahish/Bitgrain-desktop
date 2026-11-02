import React from "react";
import { Popover, PopoverSection } from "../Popover";
import { Slider } from "../slider";
import { EditableValue } from "../editable-value";

interface ContourPopoverProps {
  levels: number;
  setLevels: (v: number) => void;
  fill: boolean;
  setFill: (v: boolean) => void;
  isColor: boolean;
  toggleColor: () => void;
  onStateChangeFinished: () => void;
  onClose: () => void;
  static?: boolean;
}

const optionClass = (active: boolean): string =>
  `px-2 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
    active
      ? "bg-[var(--s-accent)] text-[var(--s-accent-text)]"
      : "text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)] hover:text-[var(--s-text)]"
  }`;

export const ContourPopover: React.FC<ContourPopoverProps> = ({
  levels,
  setLevels,
  fill,
  setFill,
  isColor,
  toggleColor,
  onStateChangeFinished,
  onClose,
  static: isStatic,
}) => (
  <Popover onClose={onClose} className="w-52" static={isStatic}>
    <PopoverSection title="Levels">
      <div className="grid grid-cols-[1fr_28px] items-center gap-x-2 px-1">
        <Slider
          label="Levels"
          min={2}
          max={20}
          step={1}
          value={levels}
          onChange={setLevels}
          onDone={onStateChangeFinished}
        />
        <EditableValue
          value={levels}
          min={2}
          max={20}
          step={1}
          onChange={setLevels}
          onCommit={onStateChangeFinished}
        />
      </div>
    </PopoverSection>

    <div className="h-px bg-[var(--s-border)] opacity-50" />
    <PopoverSection title="Fill">
      <button
        onClick={() => {
          setFill(!fill);
          onStateChangeFinished();
        }}
        className={`w-full ${optionClass(fill)}`}
      >
        {fill ? "Filled bands" : "Lines only"}
      </button>
    </PopoverSection>

    <div className="h-px bg-[var(--s-border)] opacity-50" />
    <PopoverSection title="Color">
      <button onClick={toggleColor} className={`w-full ${optionClass(isColor)}`}>
        {isColor ? "Source color on" : "Source color off"}
      </button>
    </PopoverSection>
  </Popover>
);
