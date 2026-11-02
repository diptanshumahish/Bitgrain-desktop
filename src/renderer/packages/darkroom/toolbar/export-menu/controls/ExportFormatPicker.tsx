import React from "react";
import { trackEvent } from "@bitgrain/platform/tracker";
import type { ExportFormat } from "@bitgrain/engine/export/export-types";
import { ExportGroup } from "../ExportGroup";
import { SegmentedControl, type SegmentOption } from "./SegmentedControl";
import { updateExportSettings } from "../export-settings-store";

const FORMATS: readonly SegmentOption<ExportFormat>[] = [
  { id: "png", label: "PNG" },
  { id: "webp", label: "WebP" },
  { id: "jpeg", label: "JPEG" },
  { id: "png-hdr", label: "HDR" },
];

const FORMAT_HINTS: Record<ExportFormat, string> = {
  png: "Lossless, every dot and edge stays crisp",
  webp: "Much smaller file, made for the web",
  jpeg: "Smallest file, works everywhere, no transparency",
  "png-hdr": "Brighter highlights on HDR screens, like recent iPhones and Macs",
};

const selectFormat = (format: ExportFormat): void => {
  updateExportSettings({ format });
  trackEvent("home", "export_format_selected", { details: { format } });
};

interface ExportFormatPickerProps {
  format: ExportFormat;
}

export const ExportFormatPicker: React.FC<ExportFormatPickerProps> = ({ format }) => (
  <ExportGroup label="Format">
    <SegmentedControl options={FORMATS} value={format} onChange={selectFormat} label="File format" />
    <p className="m-0 text-[12px] leading-snug text-[var(--s-text-subtle)]">{FORMAT_HINTS[format]}</p>
  </ExportGroup>
);
