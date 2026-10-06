import React from "react";
import type { GroupLayer } from "../../../data/studioTypes";
import type { PatternKind, PatternParams } from "../../../utils/pattern-engine";
import { regeneratePatternLayers } from "../../../utils/pattern-engine";
import { PanelGroup } from "../ui/panel-group";
import { Dropdown } from "../ui/dropdown";
import { PatternControls } from "../../modals/pattern/PatternControls";
import { PATTERN_PRESETS, defaultParamsFor } from "../../modals/pattern/PatternPresets";

interface PatternPropertiesProps {
  pattern: PatternParams;
  onChange: (updates: Partial<GroupLayer>) => void;
}

const KIND_OPTIONS = PATTERN_PRESETS.map((preset) => ({
  label: preset.label,
  value: preset.kind,
}));

export const PatternProperties: React.FC<PatternPropertiesProps> = ({
  pattern,
  onChange,
}) => {
  const apply = (next: PatternParams) => {
    const regenerated = regeneratePatternLayers(next);
    if (!regenerated) return;
    onChange({
      pattern: next,
      layers: regenerated.layers,
      width: regenerated.width,
      height: regenerated.height,
    });
  };

  const handleKind = (kind: string) => {
    if (kind === pattern.kind) return;
    apply(defaultParamsFor(kind as PatternKind));
  };

  return (
    <div className="flex flex-col font-editorial">
      <PanelGroup title="Pattern">
        <Dropdown options={KIND_OPTIONS} value={pattern.kind} onChange={handleKind} />
        <PatternControls params={pattern} onChange={apply} />
      </PanelGroup>
    </div>
  );
};
