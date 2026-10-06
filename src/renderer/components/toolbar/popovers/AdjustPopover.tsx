import React from "react";
import { Popover, PopoverSection } from "../Popover";
import { Slider } from "../slider";
import { EditableValue } from "../editable-value";
import type { TransformMode } from "../../../engine/types";
import { RESOLUTION_MIN, RESOLUTION_MAX } from "../../../store/transform-store";

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
}

const SliderRow: React.FC<SliderRowProps> = ({ label, value, min, max, step, suffix, scale, decimals, onChange, onDone }) => (
  <div className="grid grid-cols-[58px_1fr_34px] items-center gap-2">
    <span className="text-[10px] text-[var(--s-text-subtle)] select-none">{label}</span>
    <Slider min={min} max={max} step={step} value={value} onChange={onChange} onDone={onDone} />
    <EditableValue
      className="text-[10px]"
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

const ToggleSwitch: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
  <button
    onClick={onChange}
    role="switch"
    aria-checked={checked}
    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
      checked ? "bg-[var(--s-accent)]" : "bg-[var(--s-bg-input)]"
    }`}
  >
    <span
      className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white transform transition-transform duration-200 ${
        checked ? "translate-x-4" : "translate-x-0"
      }`}
    />
  </button>
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
    <Popover onClose={onClose} className="w-52" static={isStatic}>
      <PopoverSection>
        <div className="flex flex-col gap-2.5 px-0.5 pb-1">
          <SliderRow label="Resolution" value={resolution} min={RESOLUTION_MIN} max={RESOLUTION_MAX} step={0.1}
            scale={100} suffix="%" onChange={setResolution} onDone={onStateChangeFinished} />
          <SliderRow label="Contrast" value={contrast} min={0.5} max={3} step={0.1}
            decimals={1} suffix="x" onChange={setContrast} onDone={onStateChangeFinished} />
          <SliderRow label="Brightness" value={brightness} min={0.5} max={2} step={0.1}
            decimals={1} suffix="x" onChange={setBrightness} onDone={onStateChangeFinished} />
          <SliderRow label="Saturation" value={saturation} min={0} max={2} step={0.1}
            decimals={1} suffix="x" onChange={setSaturation} onDone={onStateChangeFinished} />
          <SliderRow label="Hue" value={hue} min={0} max={360} step={5}
            suffix="°" onChange={setHue} onDone={onStateChangeFinished} />
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[10px] text-[var(--s-text-subtle)] select-none">Film grain</span>
            <ToggleSwitch checked={filmGrain} onChange={onToggleFilmGrain} />
          </div>
          {showGrain && (
            <SliderRow label="Noise" value={grain} min={0} max={1} step={0.05}
              scale={100} suffix="%" onChange={setGrain} onDone={onStateChangeFinished} />
          )}
        </div>
      </PopoverSection>

      <div className="h-px bg-[var(--s-border)] opacity-50 mx-2" />

      <PopoverSection>
        <div className="flex items-center justify-between px-1 py-0.5">
          <div>
            <p className="text-[10px] font-medium text-[var(--s-text)]">Print finish</p>
            <p className="text-[9px] text-[var(--s-text-subtle)]">Paper grain, ink tone, soft edges</p>
          </div>
          <ToggleSwitch
            checked={printFinish}
            onChange={() => {
              setPrintFinish(!printFinish);
              onStateChangeFinished();
            }}
          />
        </div>
        {printFinish && (
          <div className="px-0.5 pt-2">
            <SliderRow label="Strength" value={printFinishStrength} min={0} max={1} step={0.05}
              scale={100} suffix="%"
              onChange={setPrintFinishStrength} onDone={onStateChangeFinished} />
          </div>
        )}
      </PopoverSection>
    </Popover>
  );
};
