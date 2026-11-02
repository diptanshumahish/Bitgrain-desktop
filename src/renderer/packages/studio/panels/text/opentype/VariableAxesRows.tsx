import React from "react";
import type { TextLayer } from "@bitgrain/studio-core/model/studio-types";
import { Dropdown } from "../../../ui/dropdown";
import { ScrubField, SmallBtn } from "@bitgrain/ui/controls/panel/panelPrimitives";
import { STRETCH_STEPS } from "@bitgrain/studio-core/render/text/advanced/canvas-features";
import type { FontAxes } from "./font-axes";
import { weightAxisPatch, withAxis } from "./variable-axes";

interface VariableAxesRowsProps {
  layer: TextLayer;
  axes: FontAxes;
  onChange: (updates: Partial<TextLayer>) => void;
}

const NORMAL_WIDTH = 100;
const SLANT_STEP = 0.5;

const widthOptions = (axes: FontAxes): Array<{ label: string; value: string }> =>
  STRETCH_STEPS.filter((step) => axes.width && step >= axes.width.min && step <= axes.width.max).map((step) => ({
    label: `${step}%`,
    value: String(step),
  }));

export const VariableAxesRows: React.FC<VariableAxesRowsProps> = ({ layer, axes, onChange }) => {
  const variations = layer.fontVariations ?? {};
  const setAxis = (axis: "wdth" | "slnt" | "opsz", value: number | undefined): void =>
    onChange({ fontVariations: withAxis(layer, axis, value) });

  return (
    <>
      {axes.weight && (
        <ScrubField label="Weight" value={variations.wght ?? Number(layer.fontWeight)} min={axes.weight.min} max={axes.weight.max} step={1} onChange={(value) => onChange(weightAxisPatch(layer, value))} />
      )}
      {axes.width && (
        <div className="flex items-center justify-between gap-3">
          <span className="text-[12px] text-[var(--s-text-subtle)] font-medium">Width</span>
          <div className="w-[120px]">
            <Dropdown options={widthOptions(axes)} value={String(variations.wdth ?? NORMAL_WIDTH)} onChange={(value) => setAxis("wdth", Number(value) === NORMAL_WIDTH ? undefined : Number(value))} />
          </div>
        </div>
      )}
      {axes.slant && (
        <ScrubField label="Slant" value={variations.slnt ?? 0} min={axes.slant.min} max={axes.slant.max} step={SLANT_STEP} suffix="°" onChange={(value) => setAxis("slnt", value === 0 ? undefined : value)} />
      )}
      {axes.opticalSize && (
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <ScrubField label="Optical" value={variations.opsz ?? layer.fontSize} min={axes.opticalSize.min} max={axes.opticalSize.max} step={1} onChange={(value) => setAxis("opsz", value)} />
          </div>
          <SmallBtn title="Match font size" active={variations.opsz === undefined} onClick={() => setAxis("opsz", undefined)}>A</SmallBtn>
        </div>
      )}
    </>
  );
};
