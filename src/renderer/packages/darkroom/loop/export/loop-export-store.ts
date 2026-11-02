import { signal } from "@bitgrain/core/signal";
import type { LoopExportPhase } from "./export-loop";

export interface LoopExportStatus {
  phase: LoopExportPhase;
  ratio: number;
}

export const loopExportStatusSignal = signal<LoopExportStatus | null>(null);
export const loopExportErrorSignal = signal<string | null>(null);

const controllerRef: { current: AbortController | null } = { current: null };

export const beginLoopExport = (): AbortController => {
  const controller = new AbortController();
  controllerRef.current = controller;
  loopExportErrorSignal.value = null;
  loopExportStatusSignal.value = { phase: "rendering", ratio: 0 };
  return controller;
};

export const endLoopExport = (): void => {
  controllerRef.current = null;
  loopExportStatusSignal.value = null;
};

export const cancelLoopExport = (): void => {
  controllerRef.current?.abort();
};
