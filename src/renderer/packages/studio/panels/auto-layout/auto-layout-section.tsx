import React from "react";
import { WrapText } from "lucide-react";
import type { AlignItems, JustifyContent, LayoutMode } from "@bitgrain/studio-core/model/studio-types";
import { PanelGroup } from "../../ui/panel-group";
import { ScrubField, Toggle } from "@bitgrain/ui/controls/panel/panelPrimitives";
import { SegmentedChoice } from "../../workspace-panel/segmented-choice";
import {
  COLUMN_ALIGN_OPTIONS, COLUMN_JUSTIFY_OPTIONS, LAYOUT_OPTIONS, ROW_ALIGN_OPTIONS, ROW_JUSTIFY_OPTIONS,
} from "../group/layout-options";
import { FieldRow } from "./field-row";
import { PaddingFields } from "./padding-fields";
import { HugFields } from "./hug-fields";
import {
  MAX_LAYOUT_SPACING, PANEL_ICON_SIZE, PANEL_ICON_STROKE, type LayoutSettings, type LayoutSettingsPatch,
} from "./layout-settings";

interface AutoLayoutSectionProps {
  settings: LayoutSettings;
  allowHug?: boolean;
  onChange: (updates: LayoutSettingsPatch) => void;
}

export const AutoLayoutSection: React.FC<AutoLayoutSectionProps> = ({ settings, allowHug = false, onChange }) => {
  const layout = settings.layout ?? "none";
  const hasLayout = layout !== "none";
  const isFlex = layout === "flex-row" || layout === "flex-col";
  const isRow = layout === "flex-row";

  return (
    <PanelGroup title="Auto layout">
      <SegmentedChoice
        label="Layout"
        options={LAYOUT_OPTIONS}
        value={layout}
        onChange={(value) => onChange({ layout: value as LayoutMode })}
      />

      {hasLayout && (
        <ScrubField label="Gap" value={settings.gap ?? 0} min={0} max={MAX_LAYOUT_SPACING} onChange={(gap) => onChange({ gap })} />
      )}

      {hasLayout && <PaddingFields settings={settings} onChange={onChange} />}

      {isFlex && (
        <FieldRow label="Align">
          <SegmentedChoice
            label="Align items"
            iconOnly
            options={isRow ? ROW_ALIGN_OPTIONS : COLUMN_ALIGN_OPTIONS}
            value={settings.alignItems ?? "start"}
            onChange={(value) => onChange({ alignItems: value as AlignItems })}
          />
        </FieldRow>
      )}

      {isFlex && (
        <FieldRow label="Spacing">
          <SegmentedChoice
            label="Distribute items"
            iconOnly
            options={isRow ? ROW_JUSTIFY_OPTIONS : COLUMN_JUSTIFY_OPTIONS}
            value={settings.justifyContent ?? "start"}
            onChange={(value) => onChange({ justifyContent: value as JustifyContent })}
          />
        </FieldRow>
      )}

      {isFlex && (
        <div className="h-7 flex items-center justify-between">
          <span className="flex items-center gap-2 text-[12px] text-[var(--s-text-subtle)] font-medium">
            <WrapText size={PANEL_ICON_SIZE} strokeWidth={PANEL_ICON_STROKE} />
            Wrap onto new lines
          </span>
          <Toggle label="Wrap" value={settings.wrap ?? false} onChange={(wrap) => onChange({ wrap })} />
        </div>
      )}

      {hasLayout && allowHug && <HugFields settings={settings} onChange={onChange} />}
    </PanelGroup>
  );
};
