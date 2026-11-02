import { useEffect } from "react";
import { commentModeSignal } from "./comment-ui-store";
import { setCommentMode, toggleCommentMode, toggleShowComments } from "./comment-mode";
import { isCommentPopoverOpen } from "./comment-popover-store";
import { closeCommentPopover } from "./thread-navigation";

const COMMENT_KEY = "c";

const isTypingTarget = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

const dialogIsOpen = (): boolean => document.querySelector('[aria-modal="true"]') !== null;

const handleEscape = (): void => {
  if (isCommentPopoverOpen()) {
    closeCommentPopover();
    return;
  }
  if (commentModeSignal.value) setCommentMode(false);
};

const handleCommentKey = (event: KeyboardEvent): void => {
  event.preventDefault();
  if (event.shiftKey) toggleShowComments();
  else toggleCommentMode();
};

export const useCommentKeys = (enabled: boolean, exitKeys: readonly string[]): void => {
  useEffect(() => {
    if (!enabled) return undefined;
    const onKeyDown = (event: KeyboardEvent): void => {
      if (isTypingTarget(event.target) || dialogIsOpen()) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const key = event.key.toLowerCase();
      if (event.key === "Escape") handleEscape();
      else if (key === COMMENT_KEY) handleCommentKey(event);
      else if (exitKeys.includes(key) && commentModeSignal.value) setCommentMode(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, exitKeys]);
};
