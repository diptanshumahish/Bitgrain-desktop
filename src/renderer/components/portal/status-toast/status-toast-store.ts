import { signal } from "../../../lib/signal";
import type { StatusToastMessage } from "./status-toast-events";

export interface StatusToastState extends StatusToastMessage {
  id: number;
  leaving: boolean;
}

const VISIBLE_MS = 4200;
const EXIT_MS = 260;

export const statusToastSignal = signal<StatusToastState | null>(null);

const timers = { leave: 0, remove: 0, nextId: 0 };

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

export const showStatusToast = (message: StatusToastMessage): void => {
  clearTimers();
  timers.nextId += 1;
  statusToastSignal.value = { ...message, id: timers.nextId, leaving: false };
  timers.leave = window.setTimeout(startLeaving, VISIBLE_MS);
};
