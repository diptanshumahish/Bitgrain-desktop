import React from "react";
import type { DitherMethod } from "../../../../../engine/types";
import type { EffectParams } from "../../../types";
import { SliderRow } from "./SliderRow";
import { Toggle } from "./filter-shared";
import { SelectMenu } from "../../ui/SelectMenu";

interface DitherParamsProps {
  params: EffectParams;
  onChange: (patch: Partial<EffectParams>) => void;
}

const DITHER_METHODS: { value: DitherMethod; label: string }[] = [
  { value: "floyd-steinberg", label: "Floyd-Steinberg" },
  { value: "atkinson", label: "Atkinson" },
  { value: "bayer-2", label: "Bayer 2x2" },
  { value: "bayer-4", label: "Bayer 4x4" },
  { value: "bayer-8", label: "Bayer 8x8" },
  { value: "blue-noise", label: "Blue noise" },
  { value: "threshold", label: "Threshold" },
  { value: "burkes", label: "Burkes" },
  { value: "stucki", label: "Stucki" },
  { value: "jjn", label: "JJN" },
  { value: "sierra", label: "Sierra" },
  { value: "sierra-2", label: "Sierra 2" },
  { value: "sierra-lite", label: "Sierra lite" },
  { value: "random", label: "Random" },
];

export const DitherParams: React.FC<DitherParamsProps> = ({ params, onChange }) => (
  <>
    <SelectMenu
      value={params.ditherMethod ?? "floyd-steinberg"}
      options={DITHER_METHODS}
      onChange={(next) => onChange({ ditherMethod: next as DitherMethod })}
      ariaLabel="Dither method"
      className="w-full"
    />
    <SliderRow label="Intensity" min={0.1} max={2} step={0.05} value={params.ditherFactor ?? 1} onChange={(v) => onChange({ ditherFactor: v })} />
    <Toggle label="Source color" active={params.isColor ?? true} onClick={() => onChange({ isColor: !(params.isColor ?? true) })} />
  </>
);
