import React from "react";
import type { GrainFillParams } from "@bitgrain/studio-core/model/layer-paint-types";
import { ScrubField } from "@bitgrain/ui/controls/panel/panelPrimitives";
import { DEFAULT_GRAIN } from "@bitgrain/studio-core/shape-render/rich/passes/grain-filter";

const MIN_SIZE = 0.5;
const MAX_SIZE = 8;
const SIZE_STEP = 0.1;
const MAX_SEED = 999;

interface GrainFillFieldsProps {
  grain: GrainFillParams | undefined;
  onChange: (grain: GrainFillParams) => void;
}

export const GrainFillFields: React.FC<GrainFillFieldsProps> = ({ grain, onChange }) => {
  const value = grain ?? DEFAULT_GRAIN;
  return (
    <div className="grid grid-cols-2 gap-2">
      <ScrubField label="Size" title="Grain size" value={value.size} min={MIN_SIZE} max={MAX_SIZE} step={SIZE_STEP} decimals={1} onChange={(size) => onChange({ ...value, size })} />
      <ScrubField label="Pattern" title="Try a different random grain pattern" value={value.seed} min={1} max={MAX_SEED} onChange={(seed) => onChange({ ...value, seed })} />
    </div>
  );
};
