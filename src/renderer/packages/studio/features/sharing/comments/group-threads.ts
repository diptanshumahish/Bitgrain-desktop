import type { CommentThread, ProjectComment } from "../api/share-types";

export function groupThreads(comments: ProjectComment[]): CommentThread[] {
  const repliesByThread = new Map<string, ProjectComment[]>();
  comments.forEach((comment) => {
    if (!comment.threadId) return;
    repliesByThread.set(comment.threadId, [...(repliesByThread.get(comment.threadId) ?? []), comment]);
  });
  return comments
    .filter((comment) => comment.threadId === null)
    .map((root) => ({ root, replies: repliesByThread.get(root.id) ?? [] }));
}

export const findThread = (threads: CommentThread[], threadId: string): CommentThread | undefined =>
  threads.find((thread) => thread.root.id === threadId);

export const hasOthersComments = (thread: CommentThread, viewerId: string | undefined): boolean =>
  [thread.root, ...thread.replies].some((comment) => comment.authorId !== viewerId);
