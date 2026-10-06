import React from "react";
import type { EffectParams } from "../../../types";
import { SliderRow } from "./SliderRow";
import { Toggle } from "./filter-shared";

interface PrintParamsProps {
  params: EffectParams;
  onChange: (patch: Partial<EffectParams>) => void;
}

export const ContourParams: React.FC<PrintParamsProps> = ({ params, onChange }) => (
  <>
    <SliderRow label="Levels" min={2} max={24} step={1} value={params.contourLevels ?? 8} onChange={(v) => onChange({ contourLevels: v })} />
    <Toggle label="Fill bands" active={params.contourFill ?? false} onClick={() => onChange({ contourFill: !params.contourFill })} />
  </>
);

export const PhotocopyParams: React.FC<PrintParamsProps> = ({ params, onChange }) => (
  <>
    <SliderRow label="Contrast" min={1} max={10} step={0.5} unit="x" value={params.photocopyContrast ?? 3} onChange={(v) => onChange({ photocopyContrast: v })} />
    <SliderRow label="Threshold" min={0} max={1} step={0.05} value={params.photocopyThreshold ?? 0.5} onChange={(v) => onChange({ photocopyThreshold: v })} />
  </>
);

export const MisprintParams: React.FC<PrintParamsProps> = ({ params, onChange }) => (
  <>
    <SliderRow label="Shift" min={0} max={24} step={1} unit="px" value={params.misprintAmount ?? 4} onChange={(v) => onChange({ misprintAmount: v })} />
    <SliderRow label="Angle" min={0} max={360} step={5} unit="°" value={params.misprintAngle ?? 0} onChange={(v) => onChange({ misprintAngle: v })} />
  </>
);

export const FoldParams: React.FC<PrintParamsProps> = ({ params, onChange }) => (
  <>
    <SliderRow label="Folds" min={1} max={6} step={1} value={params.foldCount ?? 2} onChange={(v) => onChange({ foldCount: v })} />
    <SliderRow label="Intensity" min={0} max={1} step={0.05} value={params.foldIntensity ?? 0.4} onChange={(v) => onChange({ foldIntensity: v })} />
  </>
);

export const DustParams: React.FC<PrintParamsProps> = ({ params, onChange }) => (
  <>
    <SliderRow label="Dust" min={0} max={1} step={0.02} value={params.dustAmount ?? 0.3} onChange={(v) => onChange({ dustAmount: v })} />
    <SliderRow label="Scratches" min={0} max={10} step={1} value={params.dustScratches ?? 3} onChange={(v) => onChange({ dustScratches: v })} />
    <SliderRow label="Seed" min={0} max={999} step={1} value={params.dustSeed ?? 7} onChange={(v) => onChange({ dustSeed: v })} />
  </>
);
