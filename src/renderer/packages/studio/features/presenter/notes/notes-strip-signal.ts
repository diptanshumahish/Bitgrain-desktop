import { signal } from "@bitgrain/core/signal";

const STORAGE_KEY = "bg:notes-strip-open";

const readStoredOpen = (): boolean => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
};

const storeOpen = (open: boolean): void => {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(open));
  } catch {
    return;
  }
};

export const notesStripOpenSignal = signal<boolean>(readStoredOpen());

const setNotesStripOpen = (open: boolean): void => {
  notesStripOpenSignal.value = open;
  storeOpen(open);
};

export const toggleNotesStrip = (): void => setNotesStripOpen(!notesStripOpenSignal.value);
