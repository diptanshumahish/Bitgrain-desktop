import { signal } from "../../../lib/signal";
import type { UndoToastMessage } from "./undo-toast-events";

const UNDO_WINDOW_MS = 6000;

export const undoToastSignal = signal<UndoToastMessage | null>(null);

const timer = { id: 0 };

const expireCurrent = (): void => {
  window.clearTimeout(timer.id);
  const current = undoToastSignal.value;
  undoToastSignal.value = null;
  current?.onExpire();
};

export const showUndoToast = (message: UndoToastMessage): void => {
  expireCurrent();
  undoToastSignal.value = message;
  timer.id = window.setTimeout(expireCurrent, UNDO_WINDOW_MS);
};

export const undoCurrentToast = (): void => {
  window.clearTimeout(timer.id);
  const current = undoToastSignal.value;
  undoToastSignal.value = null;
  current?.onUndo();
};
