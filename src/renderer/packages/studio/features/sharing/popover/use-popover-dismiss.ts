import { useEffect } from "react";

const KEEP_OPEN_SELECTOR = [
  "[data-popover-root]",
  "[data-comment-surface]",
  "[data-comment-pin]",
  "[data-comment-popover]",
  "[data-comments-panel]",
  "[role='dialog']",
].join(", ");

export const usePopoverDismiss = (onDismiss: () => void): void => {
  useEffect(() => {
    const handlePress = (event: MouseEvent): void => {
      const target = event.target;
      if (target instanceof Element && target.closest(KEEP_OPEN_SELECTOR)) return;
      onDismiss();
    };
    document.addEventListener("mousedown", handlePress, true);
    return () => document.removeEventListener("mousedown", handlePress, true);
  }, [onDismiss]);
};
