import { useEffect } from "react";
import { hasOpenOverlay } from "../../../editor/open-overlay";
import { studioSelectionSignal } from "../selection/selection-store";
import { copySelectionAs } from "./copy-selection";

const TYPING_SELECTOR = "input, textarea, select, [contenteditable]";

const isTypingTarget = (target: EventTarget | null): boolean =>
  !!(target as HTMLElement | null)?.closest?.(TYPING_SELECTOR);

const isCopyAsPngShortcut = (event: KeyboardEvent): boolean =>
  (event.metaKey || event.ctrlKey) && event.shiftKey && !event.altKey && event.code === "KeyC";

export const useCopyAsShortcut = (): void => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (!isCopyAsPngShortcut(event)) return;
      if (isTypingTarget(event.target) || isTypingTarget(document.activeElement) || hasOpenOverlay()) return;
      if (studioSelectionSignal.value.selectedIds.length === 0) return;
      event.preventDefault();
      void copySelectionAs("png");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
};
