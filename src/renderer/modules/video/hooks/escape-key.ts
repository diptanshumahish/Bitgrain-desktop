import { shortcutsOpenSignal } from "../store/shortcuts-store";
import { exportPanelOpenSignal } from "../engine/exporter/export-types";
import {
  selectedClipIdsSignal,
  clearClipSelection,
} from "../store/project-store";

const OPEN_DIALOG_SELECTOR = '[role="dialog"], [aria-modal="true"]';

function isDialogOpen(): boolean {
  return document.querySelector(OPEN_DIALOG_SELECTOR) !== null;
}

export function handleEscapeKey(leaveEditor: () => void): void {
  if (isDialogOpen()) return;
  if (shortcutsOpenSignal.value) {
    shortcutsOpenSignal.value = false;
    return;
  }
  if (exportPanelOpenSignal.value) {
    exportPanelOpenSignal.value = false;
    return;
  }
  if (selectedClipIdsSignal.value.length > 0) {
    clearClipSelection();
    return;
  }
  leaveEditor();
}
