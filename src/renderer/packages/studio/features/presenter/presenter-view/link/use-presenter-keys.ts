import { useEffect } from "react";

const NEXT_KEYS = new Set(["ArrowRight", "ArrowDown", "PageDown", " "]);
const PREVIOUS_KEYS = new Set(["ArrowLeft", "ArrowUp", "PageUp"]);

const deltaForKey = (key: string): number => {
  if (NEXT_KEYS.has(key)) return 1;
  if (PREVIOUS_KEYS.has(key)) return -1;
  return 0;
};

export const usePresenterKeys = (hostWindow: Window, step: (delta: number) => void): void => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      const delta = deltaForKey(event.key);
      if (delta === 0) return;
      event.preventDefault();
      step(delta);
    };
    hostWindow.addEventListener("keydown", onKeyDown);
    return () => hostWindow.removeEventListener("keydown", onKeyDown);
  }, [hostWindow, step]);
};
