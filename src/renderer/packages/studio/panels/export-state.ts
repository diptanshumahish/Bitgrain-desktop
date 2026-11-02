import { signal } from "@bitgrain/core/signal";
import type { TemplateDef, Layer, TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import type { MultiExportMode } from "../hooks/export/export-pages";

export type ScaleOption = "1x" | "2x" | "3x" | "4x" | "custom";

export const SCALE_VALUES: Record<Exclude<ScaleOption, "custom">, number> = {
  "1x": 1,
  "2x": 2,
  "3x": 3,
  "4x": 4,
};

export type ExportScope = "current" | "all" | "selection";

export interface ExportPopupData {
  template: TemplateDef;
  background: string;
  layers: Layer[];
  image: string | null;
  pages?: TemplatePage[];
  activePageId?: string;
}

export const exportPopupSignal = signal<ExportPopupData | null>(null);
// Desktop (PORTED.md): default 1x. Templates are authored at print resolution, so 2x
// quadruples pixels and balloons PNG size for no gain. 2x and 4x stay available.
export const scaleOptSignal = signal<ScaleOption>("1x");
export const customWSignal = signal(0);
export const customHSignal = signal(0);

export type ExportFormat =
  | "image/png"
  | "image/jpeg"
  | "image/webp"
  | "image/hdr-png"
  | "image/svg+xml"
  | "application/pdf"
  | "application/vnd.openxmlformats-officedocument.presentationml.presentation";

export const SVG_EXPORT_FORMAT: ExportFormat = "image/svg+xml";
export const exportFormatSignal = signal<ExportFormat>("image/png");

export const STUDIO_HDR_FORMAT: ExportFormat = "image/hdr-png";
export const PDF_EXPORT_FORMAT: ExportFormat = "application/pdf";
export const PPTX_EXPORT_FORMAT: ExportFormat = "application/vnd.openxmlformats-officedocument.presentationml.presentation";

export function isDocumentFormat(format: ExportFormat): boolean {
  return format === PDF_EXPORT_FORMAT || format === PPTX_EXPORT_FORMAT;
}

export function isStudioHdrFormat(format: ExportFormat): boolean {
  return format === STUDIO_HDR_FORMAT;
}
export const exportQualitySignal = signal<number>(0.92);
export const exportScopeSignal = signal<ExportScope>("current");
export const exportMultiModeSignal = signal<MultiExportMode>("zip");

