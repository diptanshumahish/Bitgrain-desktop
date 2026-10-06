import { signal, useSignalValue } from "../lib/signal";

const aspectLocked = signal(false);

export function isAspectLocked(): boolean {
  return aspectLocked.value;
}

export function useAspectLocked(): boolean {
  return useSignalValue(aspectLocked);
}

export function toggleAspectLock(): void {
  aspectLocked.value = !aspectLocked.value;
}
