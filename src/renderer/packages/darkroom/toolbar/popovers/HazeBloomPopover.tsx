import React from "react";
import { Popover, PopoverSection } from "@bitgrain/ui/controls/toolbar/Popover";
import { Slider } from "@bitgrain/ui/controls/toolbar/slider";
import { EditableValue } from "@bitgrain/ui/controls/toolbar/editable-value";
import type { TransformMode } from "@bitgrain/engine/core/types";
import { ToggleSwitch } from "@bitgrain/ui/controls/toolbar/controls/ToggleSwitch";
import { modesSignal } from "../../state/transform-store";

const HAZE_MODE: TransformMode = "haze-bloom";

interface HazeBloomPopoverProps {
  mode: TransformMode[];
  onToggle: () => void;
  hazeIntensity: number;
  setHazeIntensity: (v: number) => void;
  bloomIntensity: number;
  setBloomIntensity: (v: number) => void;
  bloomThreshold: number;
  setBloomThreshold: (v: number) => void;
  hazeWarmth: number;
  setHazeWarmth: (v: number) => void;
  onStateChangeFinished: () => void;
  onClose: () => void;
  static?: boolean;
}

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  onDone: () => void;
  display?: string;
  suffix?: string;
  scale?: number;
}

const SliderRow: React.FC<SliderRowProps> = ({ label, value, min, max, step, onChange, onDone, display, suffix, scale }) => (
  <div className="grid grid-cols-[84px_1fr_44px] items-center gap-2">
    <span className="text-[12px] select-none text-[var(--s-text-muted)]">{label}</span>
    <Slider label={label} min={min} max={max} step={step} value={value} onChange={onChange} onDone={onDone} />
    {suffix !== undefined ? (
      <EditableValue className="text-[12px] text-[var(--s-text-muted)]" value={value} min={min} max={max} step={step} suffix={suffix} scale={scale} onChange={onChange} onCommit={onDone} />
    ) : (
      <span className="text-[12px] text-right tabular-nums select-none text-[var(--s-text-muted)]">{display}</span>
    )}
  </div>
);

function warmthLabel(v: number): string {
  if (v < 0.35) return "cool";
  if (v > 0.65) return "warm";
  return "neutral";
}

export const HazeBloomPopover: React.FC<HazeBloomPopoverProps> = ({
  mode,
  onToggle,
  hazeIntensity,
  setHazeIntensity,
  bloomIntensity,
  setBloomIntensity,
  bloomThreshold,
  setBloomThreshold,
  hazeWarmth,
  setHazeWarmth,
  onStateChangeFinished,
  onClose,
  static: isStatic,
}) => {
  const isActive = mode.includes(HAZE_MODE);
  const turnedOn = (setter: (v: number) => void) => (value: number): void => {
    if (!modesSignal.value.includes(HAZE_MODE)) onToggle();
    setter(value);
  };

  return (
    <Popover onClose={onClose} className="w-64" static={isStatic}>
      <PopoverSection>
        <div className="flex items-center justify-between px-2 pb-1">
          <div>
            <p className="text-[12px] font-semibold text-[var(--s-text)]">Haze and glow</p>
            <p className="text-[12px] text-[var(--s-text-subtle)] mt-0.5">A soft film glow around bright areas. Move any slider to turn it on.</p>
          </div>
          <ToggleSwitch checked={isActive} onChange={onToggle} label="Haze and bloom" />
        </div>
      </PopoverSection>

      <div className="h-px bg-[var(--s-border)] opacity-50 mx-2" />

      <PopoverSection title="Haze">
        <div className={`flex flex-col gap-2.5 px-2 pb-0.5 transition-opacity ${!isActive ? "opacity-50" : ""}`}>
          <SliderRow
            label="Intensity"
            value={hazeIntensity}
            min={0} max={1} step={0.05}
            scale={100} suffix="%"
            onChange={turnedOn(setHazeIntensity)}
            onDone={onStateChangeFinished}
          />
          <SliderRow
            label="Warmth"
            value={hazeWarmth}
            min={0} max={1} step={0.05}
            display={warmthLabel(hazeWarmth)}
            onChange={turnedOn(setHazeWarmth)}
            onDone={onStateChangeFinished}
          />
        </div>
      </PopoverSection>

      <div className="h-px bg-[var(--s-border)] opacity-50 mx-2" />

      <PopoverSection title="Glow">
        <div className={`flex flex-col gap-2.5 px-2 pb-0.5 transition-opacity ${!isActive ? "opacity-50" : ""}`}>
          <SliderRow
            label="Intensity"
            value={bloomIntensity}
            min={0} max={1} step={0.05}
            scale={100} suffix="%"
            onChange={turnedOn(setBloomIntensity)}
            onDone={onStateChangeFinished}
          />
          <SliderRow
            label="Glow from"
            value={bloomThreshold}
            min={0.3} max={1} step={0.05}
            scale={100} suffix="%"
            onChange={turnedOn(setBloomThreshold)}
            onDone={onStateChangeFinished}
          />
        </div>
      </PopoverSection>
    </Popover>
  );
};
