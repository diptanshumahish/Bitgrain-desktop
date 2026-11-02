import React, { useMemo } from "react";
import type { TextLayer } from "@bitgrain/studio-core/model/studio-types";
import type { TextFontFeatures, TextNumericStyle } from "@bitgrain/studio-core/model/text-layout-types";
import { BtnGroup } from "@bitgrain/ui/controls/panel/panelPrimitives";
import { PanelGroup } from "../../../ui/panel-group";
import { detectFontAxes } from "./font-axes";
import { FeatureToggleRow } from "./FeatureToggleRow";
import { StylisticSetRow } from "./StylisticSetRow";
import { VariableAxesRows } from "./VariableAxesRows";

interface OpenTypeSectionProps {
  layer: TextLayer;
  onChange: (updates: Partial<TextLayer>) => void;
}

const FIGURE_OPTIONS = [
  { label: "Default", value: "default", title: "Font default figures" },
  { label: "Tabular", value: "tabular", title: "Equal width figures for tables" },
  { label: "Proportional", value: "proportional", title: "Figures sized to their shape" },
];

const EXPORT_NOTE = "Figure styles, fractions, stylistic sets and optical size show here but are not baked into image or PDF exports yet.";

const hasEditorOnlyFeature = (layer: TextLayer): boolean => {
  const features = layer.fontFeatures ?? {};
  return (features.numeric ?? "default") !== "default" || Boolean(features.fractions) || (features.stylisticSets ?? []).length > 0 || layer.fontVariations?.opsz !== undefined;
};

export const OpenTypeSection: React.FC<OpenTypeSectionProps> = ({ layer, onChange }) => {
  const features = layer.fontFeatures ?? {};
  const axes = useMemo(() => detectFontAxes(layer.fontFamily), [layer.fontFamily]);
  const setFeatures = (patch: TextFontFeatures): void => onChange({ fontFeatures: { ...features, ...patch } });
  const sets = features.stylisticSets ?? [];
  const toggleSet = (set: number): void =>
    setFeatures({ stylisticSets: sets.includes(set) ? sets.filter((value) => value !== set) : [...sets, set].sort((left, right) => left - right) });

  return (
    <PanelGroup title="Type details">
      <FeatureToggleRow label="Ligatures" value={features.ligatures !== false} onChange={(value) => setFeatures({ ligatures: value ? undefined : false })} />
      <FeatureToggleRow label="Small caps" value={Boolean(features.smallCaps)} onChange={(value) => setFeatures({ smallCaps: value || undefined })} />
      <FeatureToggleRow label="Fractions" value={Boolean(features.fractions)} onChange={(value) => setFeatures({ fractions: value || undefined })} />
      <BtnGroup options={FIGURE_OPTIONS} value={features.numeric ?? "default"} onChange={(value) => setFeatures({ numeric: value === "default" ? undefined : (value as TextNumericStyle) })} />
      <StylisticSetRow active={sets} onToggle={toggleSet} />
      <VariableAxesRows layer={layer} axes={axes} onChange={onChange} />
      {hasEditorOnlyFeature(layer) && (
        <p className="text-[12px] leading-snug text-[var(--s-text-subtle)]">{EXPORT_NOTE}</p>
      )}
    </PanelGroup>
  );
};
