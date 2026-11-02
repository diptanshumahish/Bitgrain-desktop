import React from "react";
import { SegmentedControl, type SegmentOption } from "./controls/SegmentedControl";
import { updateExportSettings, type ExportTab } from "./export-settings-store";

const TABS: readonly SegmentOption<ExportTab>[] = [
  { id: "image", label: "Image" },
  { id: "formats", label: "Other formats" },
  { id: "share", label: "Share" },
];

const selectTab = (tab: ExportTab): void => updateExportSettings({ tab });

interface ExportTabsProps {
  tab: ExportTab;
}

export const ExportTabs: React.FC<ExportTabsProps> = ({ tab }) => (
  <div className="px-4 pb-3">
    <SegmentedControl options={TABS} value={tab} onChange={selectTab} label="Export type" />
  </div>
);
