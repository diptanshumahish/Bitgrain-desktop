import { signal, useSignalValue } from "../lib/signal";

const shiftHeld = signal(false);

export function isShiftHeld(): boolean {
  return shiftHeld.value;
}

export function useShiftHeld(): boolean {
  return useSignalValue(shiftHeld);
}

export function initModifierKeys(): () => void {
  if (typeof window === "undefined") return () => {};
  const sync = (event: KeyboardEvent): void => {
    shiftHeld.value = event.shiftKey;
  };
  const reset = (): void => {
    shiftHeld.value = false;
  };
  window.addEventListener("keydown", sync);
  window.addEventListener("keyup", sync);
  window.addEventListener("blur", reset);
  return () => {
    window.removeEventListener("keydown", sync);
    window.removeEventListener("keyup", sync);
    window.removeEventListener("blur", reset);
  };
}
