import { useEffect } from "react";

const KEYBOARD_INSET_VAR = "--mobile-keyboard-inset";

const readKeyboardInset = (viewport: VisualViewport): number =>
  Math.max(0, Math.round(window.innerHeight - viewport.height - viewport.offsetTop));

export const useKeyboardInset = (): void => {
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const root = document.documentElement;
    const sync = (): void => {
      root.style.setProperty(KEYBOARD_INSET_VAR, `${readKeyboardInset(viewport)}px`);
    };
    sync();
    viewport.addEventListener("resize", sync);
    viewport.addEventListener("scroll", sync);
    return () => {
      viewport.removeEventListener("resize", sync);
      viewport.removeEventListener("scroll", sync);
      root.style.removeProperty(KEYBOARD_INSET_VAR);
    };
  }, []);
};
