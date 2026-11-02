import { useEffect, useRef } from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import { commentsSignal } from "../comments/comments-store";
import { linkedThreadId } from "../comments/comment-link";
import { findThread, groupThreads } from "../comments/group-threads";
import { setCommentMode } from "./comment-mode";
import { focusThread } from "./thread-focus";

export const useLinkedThread = (): void => {
  const comments = useSignalValue(commentsSignal);
  const handledRef = useRef(false);
  useEffect(() => {
    const linkedId = linkedThreadId();
    if (handledRef.current || !linkedId) return;
    const thread = findThread(groupThreads(comments), linkedId);
    if (!thread) return;
    handledRef.current = true;
    setCommentMode(true);
    focusThread(thread);
  }, [comments]);
};
