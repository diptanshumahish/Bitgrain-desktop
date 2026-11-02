import { useEffect } from "react";
import { toggleSlideSorter } from "../state/slide-sorter-store";

const SORTER_KEY_CODE = "KeyG";

const isTypingTarget = (target: EventTarget | null): boolean =>
  !!(target as HTMLElement | null)?.closest?.("input, textarea, select, [contenteditable]");

const isSorterShortcut = (event: KeyboardEvent): boolean =>
  event.code === SORTER_KEY_CODE && !event.shiftKey && !event.metaKey && !event.ctrlKey && !event.altKey;

export const useSlideSorterShortcut = (): void => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (!isSorterShortcut(event) || event.repeat || isTypingTarget(event.target)) return;
      event.preventDefault();
      toggleSlideSorter();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
};
