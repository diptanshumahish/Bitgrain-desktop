import React from "react";
import type { EffectParams } from "../../../types";
import { SliderRow } from "./SliderRow";
import { ColorPicker } from "../../../../../components/studio/ui/ColorPicker";

interface SimpleParamsProps {
  params: EffectParams;
  onChange: (patch: Partial<EffectParams>) => void;
}

const WASH_MODES: { id: "screen" | "overlay" | "multiply"; label: string }[] = [
  { id: "screen", label: "Screen" },
  { id: "overlay", label: "Overlay" },
  { id: "multiply", label: "Multiply" },
];

export const ScanlinesParams: React.FC<SimpleParamsProps> = ({ params, onChange }) => (
  <>
    <SliderRow label="Spacing" min={2} max={16} step={1} unit="px" value={params.scanlineSpacing ?? 4} onChange={(v) => onChange({ scanlineSpacing: v })} />
    <SliderRow label="Darkness" min={0} max={1} step={0.05} value={params.scanlineIntensity ?? 0.4} onChange={(v) => onChange({ scanlineIntensity: v })} />
    <SliderRow label="RGB shift" min={0} max={12} step={1} unit="px" value={params.scanlineRgbShift ?? 2} onChange={(v) => onChange({ scanlineRgbShift: v })} />
    <SliderRow label="Vignette" min={0} max={1} step={0.05} value={params.scanlineCurvature ?? 0} onChange={(v) => onChange({ scanlineCurvature: v })} />
  </>
);

export const CrosshatchParams: React.FC<SimpleParamsProps> = ({ params, onChange }) => (
  <>
    <SliderRow label="Spacing" min={3} max={20} step={1} unit="px" value={params.crosshatchSpacing ?? 8} onChange={(v) => onChange({ crosshatchSpacing: v })} />
    <SliderRow label="Thickness" min={1} max={4} step={1} unit="px" value={params.crosshatchThickness ?? 1} onChange={(v) => onChange({ crosshatchThickness: v })} />
  </>
);

export const HazeBloomParams: React.FC<SimpleParamsProps> = ({ params, onChange }) => (
  <>
    <SliderRow label="Haze" min={0} max={1} step={0.05} value={params.hazeIntensity ?? 0.3} onChange={(v) => onChange({ hazeIntensity: v })} />
    <SliderRow label="Bloom" min={0} max={1} step={0.05} value={params.bloomIntensity ?? 0.4} onChange={(v) => onChange({ bloomIntensity: v })} />
    <SliderRow label="Bloom threshold" min={0} max={1} step={0.05} value={params.bloomThreshold ?? 0.7} onChange={(v) => onChange({ bloomThreshold: v })} />
    <SliderRow label="Warmth" min={0} max={1} step={0.05} value={params.hazeWarmth ?? 0.5} onChange={(v) => onChange({ hazeWarmth: v })} />
    <ColorPicker label="Glow tint" color={params.hazeTint ?? "#ffffff"} onChange={(c) => onChange({ hazeTint: c })} />
  </>
);

export const GrainParams: React.FC<SimpleParamsProps> = ({ params, onChange }) => (
  <SliderRow label="Amount" min={0.02} max={0.6} step={0.02} value={params.noise ?? 0.12} onChange={(v) => onChange({ noise: v })} />
);

export const ColorGradeParams: React.FC<SimpleParamsProps> = ({ params, onChange }) => (
  <>
    <SliderRow label="Temperature" min={-100} max={100} step={1} value={params.gradeTemperature ?? 0} onChange={(v) => onChange({ gradeTemperature: v })} />
    <SliderRow label="Tint" min={-100} max={100} step={1} value={params.gradeTint ?? 0} onChange={(v) => onChange({ gradeTint: v })} />
    <SliderRow label="Vibrance" min={-100} max={100} step={1} value={params.gradeVibrance ?? 0} onChange={(v) => onChange({ gradeVibrance: v })} />
  </>
);

export const DuotoneParams: React.FC<SimpleParamsProps> = ({ params, onChange }) => (
  <>
    <div className="grid grid-cols-2 gap-2">
      <ColorPicker label="Shadows" color={params.duotoneShadow ?? "#1e1b4b"} onChange={(c) => onChange({ duotoneShadow: c })} />
      <ColorPicker label="Highlights" color={params.duotoneHighlight ?? "#fde68a"} onChange={(c) => onChange({ duotoneHighlight: c })} />
    </div>
    <SliderRow label="Amount" min={0} max={1} step={0.05} value={params.duotoneAmount ?? 1} onChange={(v) => onChange({ duotoneAmount: v })} />
  </>
);

export const ColorWashParams: React.FC<SimpleParamsProps> = ({ params, onChange }) => {
  const mode = params.washMode ?? "screen";
  return (
    <>
      <ColorPicker label="Color" color={params.washColor ?? "#3b82f6"} onChange={(c) => onChange({ washColor: c })} />
      <SliderRow label="Intensity" min={0} max={1} step={0.05} value={params.washIntensity ?? 0.4} onChange={(v) => onChange({ washIntensity: v })} />
      <div className="grid grid-cols-3 gap-1">
        {WASH_MODES.map((option) => (
          <button
            key={option.id}
            onClick={() => onChange({ washMode: option.id })}
            className={`px-1 py-1.5 rounded-md border text-[9px] transition-colors ${
              mode === option.id
                ? "border-[var(--s-accent)] bg-[var(--s-accent-soft)] text-[var(--s-text)]"
                : "border-[var(--s-border)] text-[var(--s-text-subtle)] hover:text-[var(--s-text)]"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </>
  );
};

export const VignetteParams: React.FC<SimpleParamsProps> = ({ params, onChange }) => (
  <>
    <SliderRow label="Amount" min={0} max={1} step={0.05} value={params.vignetteAmount ?? 0.5} onChange={(v) => onChange({ vignetteAmount: v })} />
    <SliderRow label="Radius" min={0} max={1} step={0.05} value={params.vignetteRadius ?? 0.7} onChange={(v) => onChange({ vignetteRadius: v })} />
    <SliderRow label="Softness" min={0.05} max={1} step={0.05} value={params.vignetteSoftness ?? 0.5} onChange={(v) => onChange({ vignetteSoftness: v })} />
  </>
);

export const PosterizeParams: React.FC<SimpleParamsProps> = ({ params, onChange }) => (
  <SliderRow label="Levels" min={2} max={16} step={1} value={params.posterizeLevels ?? 6} onChange={(v) => onChange({ posterizeLevels: v })} />
);

export const SharpenParams: React.FC<SimpleParamsProps> = ({ params, onChange }) => (
  <SliderRow label="Amount" min={0} max={3} step={0.1} unit="x" value={params.sharpenAmount ?? 1} onChange={(v) => onChange({ sharpenAmount: v })} />
);
