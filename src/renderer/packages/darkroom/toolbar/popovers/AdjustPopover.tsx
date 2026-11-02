import React from "react";
import { Popover, PopoverSection } from "@bitgrain/ui/controls/toolbar/Popover";
import { Slider } from "@bitgrain/ui/controls/toolbar/slider";
import { EditableValue } from "@bitgrain/ui/controls/toolbar/editable-value";
import type { TransformMode } from "@bitgrain/engine/core/types";
import { RESOLUTION_MIN, RESOLUTION_MAX } from "../../state/transform-store";
import { ToggleSwitch } from "@bitgrain/ui/controls/toolbar/controls/ToggleSwitch";

const NEUTRAL = 1;
const DEFAULT_DETAIL = 2;

interface AdjustPopoverProps {
  resolution: number;
  setResolution: (v: number) => void;
  contrast: number;
  setContrast: (v: number) => void;
  brightness: number;
  setBrightness: (v: number) => void;
  saturation: number;
  setSaturation: (v: number) => void;
  grain: number;
  setGrain: (v: number) => void;
  hue: number;
  setHue: (v: number) => void;
  printFinish: boolean;
  setPrintFinish: (v: boolean) => void;
  printFinishStrength: number;
  setPrintFinishStrength: (v: number) => void;
  mode: TransformMode[];
  filmGrain: boolean;
  onToggleFilmGrain: () => void;
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
  suffix: string;
  scale?: number;
  decimals?: number;
  onChange: (v: number) => void;
  onDone: () => void;
  resetTo?: number;
}

const SliderRow: React.FC<SliderRowProps> = ({ label, value, min, max, step, suffix, scale, decimals, onChange, onDone, resetTo }) => (
  <div className="grid grid-cols-[84px_1fr_40px] items-center gap-2">
    <span className="text-[12px] text-[var(--s-text-muted)] select-none">{label}</span>
    <Slider label={label} min={min} max={max} step={step} value={value} onChange={onChange} onDone={onDone} resetTo={resetTo} />
    <EditableValue
      className="text-[12px]"
      value={value}
      min={min}
      max={max}
      step={step}
      suffix={suffix}
      scale={scale}
      decimals={decimals}
      onChange={onChange}
      onCommit={onDone}
    />
  </div>
);

export const AdjustPopover: React.FC<AdjustPopoverProps> = ({
  resolution, setResolution, contrast, setContrast,
  brightness, setBrightness, saturation, setSaturation,
  grain, setGrain, hue, setHue,
  printFinish, setPrintFinish, printFinishStrength, setPrintFinishStrength,
  mode, filmGrain, onToggleFilmGrain, onStateChangeFinished, onClose, static: isStatic,
}) => {
  const showGrain = filmGrain || mode.includes("grunge");

  return (
    <Popover onClose={onClose} className="w-60" static={isStatic}>
      <PopoverSection>
        <div className="flex flex-col gap-2.5 px-2 pb-1">
          <SliderRow label="Resolution" value={resolution} min={RESOLUTION_MIN} max={RESOLUTION_MAX} step={0.1}
            scale={100} suffix="%" resetTo={DEFAULT_DETAIL} onChange={setResolution} onDone={onStateChangeFinished} />
          <SliderRow label="Contrast" value={contrast} min={0.5} max={3} step={0.1}
            decimals={1} suffix="x" resetTo={NEUTRAL} onChange={setContrast} onDone={onStateChangeFinished} />
          <SliderRow label="Brightness" value={brightness} min={0.5} max={2} step={0.1}
            decimals={1} suffix="x" resetTo={NEUTRAL} onChange={setBrightness} onDone={onStateChangeFinished} />
          <SliderRow label="Saturation" value={saturation} min={0} max={2} step={0.1}
            decimals={1} suffix="x" resetTo={NEUTRAL} onChange={setSaturation} onDone={onStateChangeFinished} />
          <SliderRow label="Hue" value={hue} min={0} max={360} step={5}
            suffix="°" resetTo={0} onChange={setHue} onDone={onStateChangeFinished} />
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-[var(--s-text-muted)] select-none">Film grain</span>
            <ToggleSwitch checked={filmGrain} onChange={onToggleFilmGrain} label="Film grain" />
          </div>
          {showGrain && (
            <SliderRow label="Grain amount" value={grain} min={0} max={1} step={0.05}
              scale={100} suffix="%" onChange={setGrain} onDone={onStateChangeFinished} />
          )}
        </div>
      </PopoverSection>

      <div className="h-px bg-[var(--s-border)] opacity-50 mx-2" />

      <PopoverSection>
        <div className="flex items-center justify-between px-2 py-0.5">
          <div>
            <p className="text-[12px] font-medium text-[var(--s-text)]">Paper texture</p>
            <p className="text-[12px] text-[var(--s-text-subtle)]">Paper grain, ink tone, soft edges</p>
          </div>
          <ToggleSwitch
            label="Paper texture"
            checked={printFinish}
            onChange={() => {
              setPrintFinish(!printFinish);
              onStateChangeFinished();
            }}
          />
        </div>
        {printFinish && (
          <div className="px-2 pt-2">
            <SliderRow label="Strength" value={printFinishStrength} min={0} max={1} step={0.05}
              scale={100} suffix="%"
              onChange={setPrintFinishStrength} onDone={onStateChangeFinished} />
          </div>
        )}
      </PopoverSection>
    </Popover>
  );
};
