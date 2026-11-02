import { useEffect } from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import { userSignal } from "@bitgrain/platform/auth/use-auth";
import { linkedThreadId } from "../comments/comment-link";
import { resetComments } from "../comments/comments-store";
import { commentingModeSignal, commentModeSignal, resetCommentUi, showCommentsSignal } from "../comment-state/comment-ui-store";
import { setCommentMode } from "../comment-state/comment-mode";
import { closeCommentPopover } from "../comment-state/thread-navigation";
import { useCommentsPolling } from "../comment-state/use-comments-polling";

export const useStudioCommentsSession = (workId: string | undefined): void => {
  const userId = useSignalValue(userSignal)?.id;
  const commentMode = useSignalValue(commentModeSignal);
  const showComments = useSignalValue(showCommentsSignal);

  useEffect(() => {
    if (linkedThreadId()) setCommentMode(true);
    return () => {
      closeCommentPopover();
      resetComments(null);
      resetCommentUi("off");
    };
  }, []);

  useEffect(() => {
    const canComment = !!workId && !!userId;
    resetComments(canComment && workId ? { kind: "owner", projectId: workId } : null);
    commentingModeSignal.value = canComment ? "write" : "off";
  }, [workId, userId]);

  useCommentsPolling(commentMode || showComments, `${workId}:${userId}`);
};
