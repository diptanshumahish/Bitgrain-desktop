import React from "react";
import type { ChildSizing } from "@bitgrain/studio-core/model/auto-layout-types";
import { SegmentedChoice, type SegmentedOption } from "../../workspace-panel/segmented-choice";
import { FieldRow } from "./field-row";
import type { LayoutSettings, LayoutSettingsPatch } from "./layout-settings";

interface HugFieldsProps {
  settings: LayoutSettings;
  onChange: (updates: LayoutSettingsPatch) => void;
}

const HUG_OPTIONS: SegmentedOption[] = [
  { value: "fixed", label: "Fixed", icon: null },
  { value: "hug", label: "Hug", icon: null },
];

const hugValue = (sizing: ChildSizing | undefined): string => (sizing === "hug" ? "hug" : "fixed");

export const HugFields: React.FC<HugFieldsProps> = ({ settings, onChange }) => (
  <>
    <FieldRow label="Width">
      <SegmentedChoice
        label="Width sizing"
        options={HUG_OPTIONS}
        value={hugValue(settings.layoutSizingH)}
        onChange={(value) => onChange({ layoutSizingH: value as ChildSizing })}
      />
    </FieldRow>
    <FieldRow label="Height">
      <SegmentedChoice
        label="Height sizing"
        options={HUG_OPTIONS}
        value={hugValue(settings.layoutSizingV)}
        onChange={(value) => onChange({ layoutSizingV: value as ChildSizing })}
      />
    </FieldRow>
  </>
);
