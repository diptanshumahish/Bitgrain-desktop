import { signal } from "../../../../lib/signal";
import type { BitratePreset } from "./codec-config";

export type ExportStatus = "idle" | "preparing" | "recording" | "finalizing" | "done" | "error" | "cancelled";
export type ExportQuality = "realtime-webm" | "frame-perfect-mp4";

export const exportBitratePresetSignal = signal<BitratePreset>("high");

export interface ExportProgress {
  status: ExportStatus;
  ratio: number;
  message: string;
  downloadUrl: string | null;
  fileName: string | null;
  error: string | null;
  startedAt: number | null;
}

export const exportQualitySignal = signal<ExportQuality>("frame-perfect-mp4");

const INITIAL: ExportProgress = {
  status: "idle",
  ratio: 0,
  message: "",
  downloadUrl: null,
  fileName: null,
  error: null,
  startedAt: null,
};

export const exportProgressSignal = signal<ExportProgress>(INITIAL);
export const exportPanelOpenSignal = signal(false);

export function resetExportProgress(): void {
  if (exportProgressSignal.value.downloadUrl) {
    URL.revokeObjectURL(exportProgressSignal.value.downloadUrl);
  }
  exportProgressSignal.value = { ...INITIAL };
}

export function setExportProgress(patch: Partial<ExportProgress>): void {
  exportProgressSignal.value = { ...exportProgressSignal.value, ...patch };
}
