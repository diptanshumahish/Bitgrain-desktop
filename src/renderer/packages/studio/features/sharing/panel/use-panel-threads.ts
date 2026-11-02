import { useMemo } from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import { userSignal } from "@bitgrain/platform/auth/use-auth";
import type { CommentThread } from "../api/share-types";
import { commentsSignal } from "../comments/comments-store";
import { groupThreads } from "../comments/group-threads";
import { filterThreads, searchThreads, sortThreads } from "../comments/thread-filters";
import { commentFiltersSignal, commentQuerySignal } from "../comment-state/comment-ui-store";

interface PanelThreads {
  shown: CommentThread[];
  total: number;
}

export const usePanelThreads = (pageOrder: string[]): PanelThreads => {
  const comments = useSignalValue(commentsSignal);
  const filters = useSignalValue(commentFiltersSignal);
  const query = useSignalValue(commentQuerySignal);
  const viewerId = useSignalValue(userSignal)?.id;
  return useMemo(() => {
    const threads = groupThreads(comments);
    const filtered = searchThreads(filterThreads(threads, filters, viewerId), query);
    return { shown: sortThreads(filtered, filters.sort, pageOrder), total: threads.length };
  }, [comments, filters, query, viewerId, pageOrder]);
};
