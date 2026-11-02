import { signal } from "@bitgrain/core/signal";
import type { MoshResult } from "@bitgrain/darkroom/editor/mosh/feedback/mosh-result-events";

interface MoshToastState extends MoshResult {
  id: number;
  leaving: boolean;
}

const VISIBLE_MS = 2600;
const EXIT_MS = 260;

export const moshToastSignal = signal<MoshToastState | null>(null);

const timers = { leave: 0, remove: 0, nextId: 0 };

const clearTimers = (): void => {
  window.clearTimeout(timers.leave);
  window.clearTimeout(timers.remove);
};

const startLeaving = (): void => {
  const current = moshToastSignal.value;
  if (current) moshToastSignal.value = { ...current, leaving: true };
  timers.remove = window.setTimeout(() => {
    moshToastSignal.value = null;
  }, EXIT_MS);
};

export const showMoshToast = (result: MoshResult): void => {
  clearTimers();
  timers.nextId += 1;
  moshToastSignal.value = { ...result, id: timers.nextId, leaving: false };
  timers.leave = window.setTimeout(startLeaving, VISIBLE_MS);
};
