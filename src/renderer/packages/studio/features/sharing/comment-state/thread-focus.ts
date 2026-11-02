import type { CommentThread } from "../api/share-types";
import { openThread } from "./thread-navigation";

type ThreadFocusHandler = (thread: CommentThread) => void;

const focusHandlerRef: { current: ThreadFocusHandler | null } = { current: null };

export const registerThreadFocus = (handler: ThreadFocusHandler): (() => void) => {
  focusHandlerRef.current = handler;
  return () => {
    if (focusHandlerRef.current === handler) focusHandlerRef.current = null;
  };
};

export const focusThread = (thread: CommentThread): void => {
  focusHandlerRef.current?.(thread);
  openThread(thread);
};
