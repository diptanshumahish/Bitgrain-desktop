import { useMemo } from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import { userSignal } from "@bitgrain/platform/auth/use-auth";
import type { CommentThread } from "../api/share-types";
import { commentsSignal } from "../comments/comments-store";
import { groupThreads } from "../comments/group-threads";
import { filterThreads } from "../comments/thread-filters";
import { commentFiltersSignal } from "../comment-state/comment-ui-store";

const hasPin = (thread: CommentThread): boolean => thread.root.x !== null && thread.root.y !== null;

export const usePagePinThreads = (pageId: string): CommentThread[] => {
  const comments = useSignalValue(commentsSignal);
  const filters = useSignalValue(commentFiltersSignal);
  const viewerId = useSignalValue(userSignal)?.id;
  return useMemo(
    () => filterThreads(groupThreads(comments), filters, viewerId).filter((thread) => hasPin(thread) && thread.root.pageId === pageId),
    [comments, filters, viewerId, pageId],
  );
};
