import React from "react";
import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import type { ChildSizing } from "@bitgrain/studio-core/model/auto-layout-types";
import { hasAutoLayout, isLayoutContainer } from "@bitgrain/studio-core/layout/auto-layout";
import { SegmentedChoice, type SegmentedOption } from "../../workspace-panel/segmented-choice";
import { FieldRow } from "./field-row";

interface ChildSizingFieldsProps {
  layer: Layer;
  onChange: (updates: Partial<Layer>) => void;
}

const FIXED_OPTION: SegmentedOption = { value: "fixed", label: "Fixed", icon: null };
const HUG_OPTION: SegmentedOption = { value: "hug", label: "Hug", icon: null };
const FILL_OPTION: SegmentedOption = { value: "fill", label: "Fill", icon: null };

const sizingOptions = (layer: Layer): SegmentedOption[] =>
  isLayoutContainer(layer) && hasAutoLayout(layer) ? [FIXED_OPTION, HUG_OPTION, FILL_OPTION] : [FIXED_OPTION, FILL_OPTION];

export const ChildSizingFields: React.FC<ChildSizingFieldsProps> = ({ layer, onChange }) => {
  const options = sizingOptions(layer);
  return (
    <>
      <FieldRow label="Width">
        <SegmentedChoice
          label="Width in auto layout"
          options={options}
          value={layer.layoutSizingH ?? "fixed"}
          onChange={(value) => onChange({ layoutSizingH: value as ChildSizing })}
        />
      </FieldRow>
      <FieldRow label="Height">
        <SegmentedChoice
          label="Height in auto layout"
          options={options}
          value={layer.layoutSizingV ?? "fixed"}
          onChange={(value) => onChange({ layoutSizingV: value as ChildSizing })}
        />
      </FieldRow>
    </>
  );
};
