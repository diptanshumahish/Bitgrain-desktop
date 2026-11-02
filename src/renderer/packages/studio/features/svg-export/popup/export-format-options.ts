import type { SegmentOption } from "../../../panels/export-popup/SegmentedControl";
import type { ExportFormat, ExportScope, ScaleOption } from "../../../panels/export-state";
import { PDF_EXPORT_FORMAT, PPTX_EXPORT_FORMAT, SVG_EXPORT_FORMAT } from "../../../panels/export-state";
import type { MultiExportMode } from "../../../hooks/export/export-pages";

export const SCALE_SEGMENTS: SegmentOption<ScaleOption>[] = (["1x", "2x", "3x", "4x", "custom"] as const).map(
  (option) => ({ label: option === "custom" ? "Custom" : option, value: option }),
);

export const FORMAT_OPTIONS: SegmentOption<ExportFormat>[] = [
  { label: "PNG", value: "image/png" },
  { label: "JPG", value: "image/jpeg" },
  { label: "WEBP", value: "image/webp" },
  { label: "SVG", value: SVG_EXPORT_FORMAT },
  { label: "PDF", value: PDF_EXPORT_FORMAT },
  { label: "PowerPoint", value: PPTX_EXPORT_FORMAT },
];

const LOCKED_SVG_LABEL = "SVG (Pro)";

export const formatOptionsFor = (svgLocked: boolean): SegmentOption<ExportFormat>[] =>
  svgLocked
    ? FORMAT_OPTIONS.map((option) => (option.value === SVG_EXPORT_FORMAT ? { ...option, label: LOCKED_SVG_LABEL } : option))
    : FORMAT_OPTIONS;

export const MULTI_MODE_OPTIONS: SegmentOption<MultiExportMode>[] = [
  { label: "ZIP", value: "zip" },
  { label: "Separate files", value: "separate" },
];

export const isSvgFormat = (format: ExportFormat): boolean => format === SVG_EXPORT_FORMAT;

export const resolveExportScope = (scope: ExportScope, hasMultiplePages: boolean, hasSelection: boolean): ExportScope => {
  if (scope === "selection") return hasSelection ? "selection" : "current";
  return hasMultiplePages ? scope : "current";
};
