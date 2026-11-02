import { useEffect } from "react";
import { loadComments } from "../comments/comment-actions";

const COMMENTS_POLL_MS = 30_000;

const refreshWhenVisible = (): void => {
  if (document.visibilityState === "visible") void loadComments();
};

export const useCommentsPolling = (enabled: boolean, sessionKey: string): void => {
  useEffect(() => {
    if (!enabled) return undefined;
    void loadComments();
    const timer = window.setInterval(refreshWhenVisible, COMMENTS_POLL_MS);
    return () => window.clearInterval(timer);
  }, [enabled, sessionKey]);
};
