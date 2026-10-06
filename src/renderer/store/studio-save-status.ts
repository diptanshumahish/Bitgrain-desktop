import { signal } from "../lib/signal";

export type SaveStatus = "idle" | "saving" | "saved";

export const saveStatusSignal = signal<SaveStatus>("idle");

export const dirtySignal = signal<boolean>(false);

export const markDirty = (): void => {
  dirtySignal.value = true;
};

export const markClean = (): void => {
  dirtySignal.value = false;
};

const SAVED_VISIBLE_MS = 1600;
let resetTimer: ReturnType<typeof setTimeout> | null = null;

export const markSaving = (): void => {
  if (resetTimer) {
    clearTimeout(resetTimer);
    resetTimer = null;
  }
  saveStatusSignal.value = "saving";
};

export const markSaved = (): void => {
  saveStatusSignal.value = "saved";
  if (resetTimer) clearTimeout(resetTimer);
  resetTimer = setTimeout(() => {
    saveStatusSignal.value = "idle";
  }, SAVED_VISIBLE_MS);
};
