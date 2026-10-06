import { signal } from "../../../lib/signal";
import type { TemplateDef, Layer, TemplatePage } from "../../../data/studioTypes";
import type { MultiExportMode } from "../hooks/export/export-pages";

export type ScaleOption = "1x" | "2x" | "4x" | "custom";

export const SCALE_VALUES: Record<Exclude<ScaleOption, "custom">, number> = {
  "1x": 1,
  "2x": 2,
  "4x": 4,
};

export type ExportScope = "current" | "all";

export interface ExportPopupData {
  template: TemplateDef;
  background: string;
  layers: Layer[];
  image: string | null;
  anchorRect: DOMRect;
  pages?: TemplatePage[];
  activePageId?: string;
}

export const exportPopupSignal = signal<ExportPopupData | null>(null);
// Default to 1x: templates are already authored at print resolution (e.g. A4 is
// 2480×3508 = 300dpi), so 2x quadruples the pixels and balloons PNG size for no
// real gain. Users can still pick 2x/4x explicitly.
export const scaleOptSignal = signal<ScaleOption>("1x");
export const customWSignal = signal(0);
export const customHSignal = signal(0);

export type ExportFormat = "image/png" | "image/jpeg" | "image/webp" | "image/hdr-png";
export const exportFormatSignal = signal<ExportFormat>("image/png");

export const STUDIO_HDR_FORMAT: ExportFormat = "image/hdr-png";

export function isStudioHdrFormat(format: ExportFormat): boolean {
  return format === STUDIO_HDR_FORMAT;
}
export const exportQualitySignal = signal<number>(0.92);
export const exportScopeSignal = signal<ExportScope>("current");
export const exportMultiModeSignal = signal<MultiExportMode>("zip");

