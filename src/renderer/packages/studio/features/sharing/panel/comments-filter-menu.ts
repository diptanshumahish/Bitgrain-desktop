import type { CommentFilters } from "../comments/thread-filters";
import { markAllThreadsRead } from "../comments/comment-read-actions";
import { commentFiltersSignal, updateCommentFilters } from "../comment-state/comment-ui-store";
import { openCommentMenu, type CommentMenuEntry } from "../comment-ui/menu/comment-menu";

const sortEntries = (filters: CommentFilters): CommentMenuEntry[] => [
  { label: "Sort by date", checked: filters.sort === "date", onSelect: () => updateCommentFilters({ sort: "date" }) },
  { label: "Sort by page", checked: filters.sort === "page", onSelect: () => updateCommentFilters({ sort: "page" }) },
];

const filterEntries = (filters: CommentFilters, signedIn: boolean): CommentMenuEntry[] => {
  const entries: CommentMenuEntry[] = [
    {
      label: "Show resolved comments",
      checked: filters.showResolved,
      separatorBefore: true,
      onSelect: () => updateCommentFilters({ showResolved: !filters.showResolved }),
    },
  ];
  if (!signedIn) return entries;
  return [
    ...entries,
    { label: "Only your threads", checked: filters.onlyMine, onSelect: () => updateCommentFilters({ onlyMine: !filters.onlyMine }) },
    { label: "Only unread", checked: filters.onlyUnread, onSelect: () => updateCommentFilters({ onlyUnread: !filters.onlyUnread }) },
    { label: "Mark all as read", checked: false, separatorBefore: true, onSelect: () => void markAllThreadsRead() },
  ];
};

export const openCommentsFilterMenu = (anchor: HTMLElement, signedIn: boolean): void => {
  const filters = commentFiltersSignal.value;
  openCommentMenu(anchor, [...sortEntries(filters), ...filterEntries(filters, signedIn)]);
};
