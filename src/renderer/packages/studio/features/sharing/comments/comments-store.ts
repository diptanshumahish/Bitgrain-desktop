import { signal } from "@bitgrain/core/signal";
import type { CommentSource, ProjectComment } from "../api/share-types";

export const commentsSignal = signal<ProjectComment[]>([]);
export const commentSourceSignal = signal<CommentSource | null>(null);
export const commentsLoadingSignal = signal<boolean>(false);
export const commentErrorSignal = signal<string | null>(null);
export const commentPostingSignal = signal<boolean>(false);
export const commentsNotSyncedSignal = signal<boolean>(false);

export const resetComments = (source: CommentSource | null): void => {
  commentSourceSignal.value = source;
  commentsSignal.value = [];
  commentErrorSignal.value = null;
  commentPostingSignal.value = false;
  commentsNotSyncedSignal.value = false;
};

export const replaceComment = (updated: ProjectComment): void => {
  commentsSignal.value = commentsSignal.value.map((comment) =>
    comment.id === updated.id ? { ...updated, unread: comment.unread } : comment,
  );
};

export const patchLocalComment = (commentId: string, patch: Partial<ProjectComment>): void => {
  commentsSignal.value = commentsSignal.value.map((comment) =>
    comment.id === commentId ? { ...comment, ...patch } : comment,
  );
};

export const appendComment = (created: ProjectComment): void => {
  commentsSignal.value = [...commentsSignal.value, created];
};

export const dropComment = (removed: ProjectComment): void => {
  commentsSignal.value = commentsSignal.value.filter(
    (comment) => comment.id !== removed.id && comment.threadId !== removed.id,
  );
};
