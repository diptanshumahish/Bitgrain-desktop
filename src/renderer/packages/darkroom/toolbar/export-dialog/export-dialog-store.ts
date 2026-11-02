import { signal } from "@bitgrain/core/signal";
import { emitPopover } from "@bitgrain/ui/overlays/popover-events";
import { currentExportBaseName } from "../../editor/export/export-filename";
import { readOutputSnapshot, type OutputSnapshot } from "./read-output-snapshot";

interface ExportDialogState {
  snapshot: OutputSnapshot | null;
  fileName: string;
}

export const exportDialogSignal = signal<ExportDialogState | null>(null);

export const openExportDialog = (): void => {
  exportDialogSignal.value = { snapshot: readOutputSnapshot(), fileName: currentExportBaseName() };
};

export const closeExportDialog = (): void => {
  emitPopover(null);
  exportDialogSignal.value = null;
};
