import { signal } from "@bitgrain/core/signal";
import type { ExportFormat } from "@bitgrain/engine/export/export-types";

export type ExportScale = 1 | 2 | 4;
export type ExportTab = "image" | "formats" | "share";

export interface ExportSettings {
  tab: ExportTab;
  format: ExportFormat;
  scale: ExportScale;
  quality: number;
  reducePalette: boolean;
}

const DEFAULT_QUALITY = 92;

export const exportSettingsSignal = signal<ExportSettings>({
  tab: "image",
  format: "png",
  scale: 1,
  quality: DEFAULT_QUALITY,
  reducePalette: false,
});

export const updateExportSettings = (patch: Partial<ExportSettings>): void => {
  exportSettingsSignal.value = { ...exportSettingsSignal.value, ...patch };
};
