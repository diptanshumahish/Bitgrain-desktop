import React from "react";
import { Popover, PopoverSection } from "../../Popover";
import type { TransformMode } from "../../../../engine/types";
import type { PresetConfig } from "../../../../engine/presets";
import { ToggleSwitch } from "../../controls/ToggleSwitch";
import { HalftonePresetStrip } from "./HalftonePresetStrip";
import { HalftoneEssentials } from "./HalftoneEssentials";
import { HalftoneAdvanced } from "./HalftoneAdvanced";
import { useHalftoneControls } from "./use-halftone-controls";

interface HalftonePopoverProps {
  mode: TransformMode[];
  onToggle: () => void;
  onApplyPreset: (config: PresetConfig) => void;
  onStateChangeFinished: () => void;
  onClose: () => void;
  static?: boolean;
}

const Divider: React.FC = () => <div className="h-px bg-[var(--s-border)] opacity-50 mx-2" />;

export const HalftonePopover: React.FC<HalftonePopoverProps> = ({
  mode,
  onToggle,
  onApplyPreset,
  onStateChangeFinished,
  onClose,
  static: isStatic,
}) => {
  const controls = useHalftoneControls();
  const isActive = mode.includes("halftone");
  const inactiveClass = isActive ? "" : "opacity-40 pointer-events-none";

  return (
    <Popover onClose={onClose} className="w-72" static={isStatic}>
      <PopoverSection>
        <div className="flex items-center justify-between px-1 pb-1">
          <div>
            <p className="text-[12px] font-semibold text-[var(--s-text)]">Halftone</p>
            <p className="text-[12px] text-[var(--s-text-subtle)] mt-0.5">Pick a look, then fine tune</p>
          </div>
          <ToggleSwitch checked={isActive} label="Halftone" onChange={onToggle} />
        </div>
      </PopoverSection>
      <Divider />
      <PopoverSection title="Looks">
        <HalftonePresetStrip onApplyPreset={onApplyPreset} />
      </PopoverSection>
      <Divider />
      <div className={`transition-opacity ${inactiveClass}`}>
        <PopoverSection>
          <HalftoneEssentials controls={controls} onDone={onStateChangeFinished} />
        </PopoverSection>
        <Divider />
        <PopoverSection>
          <HalftoneAdvanced controls={controls} onDone={onStateChangeFinished} />
        </PopoverSection>
      </div>
    </Popover>
  );
};
