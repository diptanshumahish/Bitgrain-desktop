import { signal } from "@bitgrain/core/signal";

export type MobileExportFormat = "image/png" | "image/jpeg";
export type MobileExportSize = "standard" | "high" | "max";
type MobileExportStatus = "idle" | "rendering" | "ready";

export const MOBILE_EXPORT_SCALE: Record<MobileExportSize, number> = {
  standard: 1,
  high: 2,
  max: 3,
};

export const mobileExportFormatSignal = signal<MobileExportFormat>("image/png");
export const mobileExportSizeSignal = signal<MobileExportSize>("high");
export const mobileExportStatusSignal = signal<MobileExportStatus>("idle");
export const mobileExportFileSignal = signal<File | null>(null);

export const resetMobileExport = (): void => {
  mobileExportStatusSignal.value = "idle";
  mobileExportFileSignal.value = null;
};
