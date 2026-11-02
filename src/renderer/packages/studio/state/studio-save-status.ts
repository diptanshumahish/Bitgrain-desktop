import { signal } from "@bitgrain/core/signal";

export type SaveStatus = "idle" | "saving" | "syncing" | "saved" | "retrying" | "needs_pro";

export const saveStatusSignal = signal<SaveStatus>("idle");

export const dirtySignal = signal<boolean>(false);

let editGeneration = 0;

export const markDirty = (): void => {
  editGeneration += 1;
  dirtySignal.value = true;
};

export const markClean = (): void => {
  dirtySignal.value = false;
};

export const currentEditGeneration = (): number => editGeneration;

export const markCleanUpTo = (generation: number): void => {
  if (generation === editGeneration) markClean();
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

export const markSyncing = (): void => {
  if (resetTimer) clearTimeout(resetTimer);
  resetTimer = null;
  saveStatusSignal.value = "syncing";
};

const clearResetTimer = (): void => {
  if (resetTimer) clearTimeout(resetTimer);
  resetTimer = null;
};

export const markRetrying = (): void => {
  clearResetTimer();
  saveStatusSignal.value = "retrying";
};

export const markNeedsPro = (): void => {
  clearResetTimer();
  saveStatusSignal.value = "needs_pro";
};
