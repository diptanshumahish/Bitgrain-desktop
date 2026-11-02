import { signal } from "@bitgrain/core/signal";
import { pickToastAnchor } from "../layers/toast-anchor";
import type { ToastAnchor } from "../layers/toast-anchor";
import type { UndoToastMessage } from "./undo-toast-events";

interface UndoToastState extends UndoToastMessage {
  anchor: ToastAnchor;
}

const UNDO_WINDOW_MS = 6000;

export const undoToastSignal = signal<UndoToastState | null>(null);

const timer = { id: 0 };

const expireCurrent = (): void => {
  window.clearTimeout(timer.id);
  const current = undoToastSignal.value;
  undoToastSignal.value = null;
  current?.onExpire();
};

export const showUndoToast = (message: UndoToastMessage): void => {
  expireCurrent();
  undoToastSignal.value = { ...message, anchor: pickToastAnchor() };
  timer.id = window.setTimeout(expireCurrent, UNDO_WINDOW_MS);
};

export const undoCurrentToast = (): void => {
  window.clearTimeout(timer.id);
  const current = undoToastSignal.value;
  undoToastSignal.value = null;
  current?.onUndo();
};
