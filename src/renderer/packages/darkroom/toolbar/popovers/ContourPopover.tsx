import React from "react";
import { Popover, PopoverSection } from "@bitgrain/ui/controls/toolbar/Popover";
import { Slider } from "@bitgrain/ui/controls/toolbar/slider";
import { EditableValue } from "@bitgrain/ui/controls/toolbar/editable-value";
import { SegmentedControl, type SegmentOption } from "@bitgrain/ui/controls/toolbar/controls/SegmentedControl";
import { ToggleRow } from "@bitgrain/ui/controls/toolbar/controls/ToggleRow";

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
const FILL_OPTIONS: SegmentOption<boolean>[] = [
  { label: "Lines only", value: false },
  { label: "Filled bands", value: true },
];

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
      <SegmentedControl
        label="Fill"
        options={FILL_OPTIONS}
        value={fill}
        onChange={(value) => {
          setFill(value);
          onStateChangeFinished();
        }}
      />
    </PopoverSection>

    <div className="h-px bg-[var(--s-border)] opacity-50" />
    <PopoverSection>
      <ToggleRow label="Source colour" hint="Keep the photo's own colours" checked={isColor} onChange={toggleColor} />
    </PopoverSection>
  </Popover>
);
