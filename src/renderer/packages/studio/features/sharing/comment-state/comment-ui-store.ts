import { signal } from "@bitgrain/core/signal";
import type { CommentingMode } from "../api/share-types";
import { DEFAULT_COMMENT_FILTERS, type CommentFilters } from "../comments/thread-filters";

export const commentModeSignal = signal<boolean>(false);
export const showCommentsSignal = signal<boolean>(false);
export const commentingModeSignal = signal<CommentingMode>("off");
export const hoveredThreadSignal = signal<string | null>(null);
export const commentFiltersSignal = signal<CommentFilters>(DEFAULT_COMMENT_FILTERS);
export const commentQuerySignal = signal<string>("");
export const editingCommentSignal = signal<string | null>(null);

export const updateCommentFilters = (patch: Partial<CommentFilters>): void => {
  commentFiltersSignal.value = { ...commentFiltersSignal.value, ...patch };
};

export const resetCommentUi = (commenting: CommentingMode): void => {
  commentModeSignal.value = false;
  showCommentsSignal.value = false;
  commentingModeSignal.value = commenting;
  hoveredThreadSignal.value = null;
  commentFiltersSignal.value = DEFAULT_COMMENT_FILTERS;
  commentQuerySignal.value = "";
  editingCommentSignal.value = null;
};
