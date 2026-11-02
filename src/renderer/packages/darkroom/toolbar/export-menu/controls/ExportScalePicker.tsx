import React from "react";
import { trackEvent } from "@bitgrain/platform/tracker";
import { useSignalValue } from "@bitgrain/core/signal";
import { imageMetaSignal } from "../../../state/image-store";
import { ExportGroup } from "../ExportGroup";
import { SegmentedControl, type SegmentOption } from "./SegmentedControl";
import { updateExportSettings, type ExportScale } from "../export-settings-store";

const SCALES: readonly SegmentOption<ExportScale>[] = [
  { id: 1, label: "1×" },
  { id: 2, label: "2×" },
  { id: 4, label: "4×" },
];

const selectScale = (scale: ExportScale): void => {
  updateExportSettings({ scale });
  trackEvent("home", "export_scale_selected", { details: { scale } });
};

interface ExportScalePickerProps {
  scale: ExportScale;
}

export const ExportScalePicker: React.FC<ExportScalePickerProps> = ({ scale }) => {
  const meta = useSignalValue(imageMetaSignal);
  const dimensions = meta ? (
    <span className="text-[12px] text-[var(--s-text-subtle)] tabular-nums">
      {meta.width * scale} × {meta.height * scale} px
    </span>
  ) : null;
  return (
    <ExportGroup label="Size" aside={dimensions}>
      <SegmentedControl options={SCALES} value={scale} onChange={selectScale} label="Export size" />
    </ExportGroup>
  );
};
