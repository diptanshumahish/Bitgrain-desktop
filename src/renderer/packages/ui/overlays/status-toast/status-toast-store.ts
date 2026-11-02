import { signal } from "@bitgrain/core/signal";
import { presentingSignal } from "../presentation-mode";
import { pickToastAnchor } from "../layers/toast-anchor";
import type { ToastAnchor } from "../layers/toast-anchor";
import type { StatusToastMessage } from "./status-toast-events";

interface StatusToastState extends StatusToastMessage {
  id: number;
  leaving: boolean;
  anchor: ToastAnchor;
}

const VISIBLE_MS = 4200;
const EXIT_MS = 260;

export const statusToastSignal = signal<StatusToastState | null>(null);

const timers = { leave: 0, remove: 0, nextId: 0 };
const deferred: { message: StatusToastMessage | null } = { message: null };

const clearTimers = (): void => {
  window.clearTimeout(timers.leave);
  window.clearTimeout(timers.remove);
};

const startLeaving = (): void => {
  const current = statusToastSignal.value;
  if (current) statusToastSignal.value = { ...current, leaving: true };
  timers.remove = window.setTimeout(() => {
    statusToastSignal.value = null;
  }, EXIT_MS);
};

const presentToast = (message: StatusToastMessage): void => {
  clearTimers();
  timers.nextId += 1;
  statusToastSignal.value = { ...message, id: timers.nextId, leaving: false, anchor: pickToastAnchor() };
  timers.leave = window.setTimeout(startLeaving, VISIBLE_MS);
};

const flushDeferredToast = (): void => {
  const message = deferred.message;
  if (presentingSignal.value || !message) return;
  deferred.message = null;
  presentToast(message);
};

presentingSignal.subscribe(flushDeferredToast);

export const showStatusToast = (message: StatusToastMessage): void => {
  if (presentingSignal.value) {
    clearTimers();
    statusToastSignal.value = null;
    deferred.message = message;
    return;
  }
  presentToast(message);
};
