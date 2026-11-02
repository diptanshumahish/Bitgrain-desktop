import { signal } from "@bitgrain/core/signal";

const STORAGE_KEY = "bg:notes-strip-visible";

const readStoredVisible = (): boolean => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== "false";
  } catch {
    return true;
  }
};

const storeVisible = (visible: boolean): void => {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(visible));
  } catch {
    return;
  }
};

export const notesStripVisibleSignal = signal<boolean>(readStoredVisible());

export const toggleNotesStripVisible = (): void => {
  const next = !notesStripVisibleSignal.value;
  notesStripVisibleSignal.value = next;
  storeVisible(next);
};
