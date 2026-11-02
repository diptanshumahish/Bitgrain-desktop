import React from "react";
import type { ParamSpec, ParamValue, ParamValues } from "@bitgrain/engine/styles/engine/style-types";
import { ParamControl } from "./ParamControl";
import { AdvancedSection } from "./AdvancedSection";

interface ParamListProps {
  specs: readonly ParamSpec[];
  values: ParamValues;
  onChange: (key: string, value: ParamValue) => void;
  onCommit: () => void;
}

const renderControls = (specs: readonly ParamSpec[], props: ParamListProps): React.ReactNode =>
  specs.map((spec) => (
    <ParamControl key={spec.key} spec={spec} value={props.values[spec.key] ?? spec.default}
      onChange={(value) => props.onChange(spec.key, value)} onCommit={props.onCommit} />
  ));

export const ParamList: React.FC<ParamListProps> = (props) => {
  const primary = props.specs.filter((spec) => !spec.advanced);
  const advanced = props.specs.filter((spec) => spec.advanced);
  return (
    <div className="flex flex-col gap-2">
      {renderControls(primary, props)}
      {advanced.length > 0 && <AdvancedSection>{renderControls(advanced, props)}</AdvancedSection>}
    </div>
  );
};
