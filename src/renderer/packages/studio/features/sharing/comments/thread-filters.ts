import type { CommentThread } from "../api/share-types";

type ThreadSort = "date" | "page";

export interface CommentFilters {
  sort: ThreadSort;
  showResolved: boolean;
  onlyMine: boolean;
  onlyUnread: boolean;
}

export const DEFAULT_COMMENT_FILTERS: CommentFilters = {
  sort: "date",
  showResolved: false,
  onlyMine: false,
  onlyUnread: false,
};

const isMine = (thread: CommentThread, viewerId: string | undefined): boolean =>
  !!viewerId && [thread.root, ...thread.replies].some((comment) => comment.authorId === viewerId);

const passesFilters = (thread: CommentThread, filters: CommentFilters, viewerId: string | undefined): boolean => {
  if (!filters.showResolved && thread.root.resolvedAt !== null) return false;
  if (filters.onlyMine && !isMine(thread, viewerId)) return false;
  return !filters.onlyUnread || thread.root.unread;
};

export function filterThreads(threads: CommentThread[], filters: CommentFilters, viewerId: string | undefined): CommentThread[] {
  return threads.filter((thread) => passesFilters(thread, filters, viewerId));
}

const matchesQuery = (thread: CommentThread, query: string): boolean =>
  [thread.root, ...thread.replies].some(
    (comment) => comment.body.toLowerCase().includes(query) || comment.authorName.toLowerCase().includes(query),
  );

export function searchThreads(threads: CommentThread[], rawQuery: string): CommentThread[] {
  const query = rawQuery.trim().toLowerCase();
  return query === "" ? threads : threads.filter((thread) => matchesQuery(thread, query));
}

const lastActivity = (thread: CommentThread): number =>
  Math.max(...[thread.root, ...thread.replies].map((comment) => new Date(comment.createdAt).getTime()));

const pageRank = (pageOrder: string[], pageId: string): number => {
  const index = pageOrder.indexOf(pageId);
  return index === -1 ? pageOrder.length : index;
};

export function sortThreads(threads: CommentThread[], sort: ThreadSort, pageOrder: string[]): CommentThread[] {
  const byDate = [...threads].sort((first, second) => lastActivity(second) - lastActivity(first));
  if (sort === "date") return byDate;
  return byDate.sort((first, second) => pageRank(pageOrder, first.root.pageId) - pageRank(pageOrder, second.root.pageId));
}
