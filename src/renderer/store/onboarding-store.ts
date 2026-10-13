import { signal } from "../lib/signal";

const PRINT_HINT_KEY = "imgi_print_finish_hint_seen";

const readSeen = (): boolean => {
  try {
    return localStorage.getItem(PRINT_HINT_KEY) === "true";
  } catch {
    return true;
  }
};

export const printHintSeenSignal = signal<boolean>(readSeen());

export function dismissPrintHint(): void {
  if (printHintSeenSignal.value) return;
  printHintSeenSignal.value = true;
  try {
    localStorage.setItem(PRINT_HINT_KEY, "true");
  } catch {
    printHintSeenSignal.value = true;
  }
}

const HOME_TOUR_KEY = "imgi_tutorial_home_done";

const readHomeTourDone = (): boolean => {
  try {
    return localStorage.getItem(HOME_TOUR_KEY) !== null;
  } catch {
    return true;
  }
};

export const homeTourDoneSignal = signal<boolean>(readHomeTourDone());

export function markHomeTourDone(): void {
  homeTourDoneSignal.value = true;
}
