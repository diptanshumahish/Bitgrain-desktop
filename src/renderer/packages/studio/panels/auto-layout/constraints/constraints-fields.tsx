import React from "react";
import type { HorizontalConstraint, LayerConstraints, VerticalConstraint } from "@bitgrain/studio-core/model/auto-layout-types";
import { Dropdown } from "../../../ui/dropdown";
import { ConstraintWidget } from "./constraint-widget";
import { HORIZONTAL_CONSTRAINT_OPTIONS, VERTICAL_CONSTRAINT_OPTIONS } from "./constraint-options";

interface ConstraintsFieldsProps {
  constraints: LayerConstraints;
  onChange: (constraints: LayerConstraints) => void;
}

export const ConstraintsFields: React.FC<ConstraintsFieldsProps> = ({ constraints, onChange }) => (
  <div className="flex items-center gap-3">
    <ConstraintWidget constraints={constraints} onChange={onChange} />
    <div className="flex flex-col gap-2 flex-1 min-w-0">
      <Dropdown
        value={constraints.horizontal}
        options={HORIZONTAL_CONSTRAINT_OPTIONS}
        onChange={(value) => onChange({ ...constraints, horizontal: value as HorizontalConstraint })}
      />
      <Dropdown
        value={constraints.vertical}
        options={VERTICAL_CONSTRAINT_OPTIONS}
        onChange={(value) => onChange({ ...constraints, vertical: value as VerticalConstraint })}
      />
    </div>
  </div>
);
