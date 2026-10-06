import { signal } from "../../lib/signal";

export type ExportPhase = "rendering" | "scaling" | "encoding" | "done";

export interface ExportProgressState {
  phase: ExportPhase;
  value: number;
  label: string;
}

export const INDETERMINATE = -1;

export const exportProgressSignal = signal<ExportProgressState | null>(null);

export function setExportProgress(state: ExportProgressState | null): void {
  exportProgressSignal.value = state;
}

const PHASE_LABELS: Record<ExportPhase, string> = {
  rendering: "rendering effect",
  scaling: "preparing pixels",
  encoding: "encoding file",
  done: "saved",
};

export function reportProgress(phase: ExportPhase, value: number): void {
  setExportProgress({ phase, value, label: PHASE_LABELS[phase] });
}

const CLEAR_DELAY_MS = 1700;

export function finishProgress(): void {
  reportProgress("done", 1);
  window.setTimeout(() => {
    if (exportProgressSignal.value?.phase === "done") setExportProgress(null);
  }, CLEAR_DELAY_MS);
}
