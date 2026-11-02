import { deleteThreadRead, putAllThreadsRead, putThreadRead } from "../api/comment-read-api";
import type { ProjectComment } from "../api/share-types";
import { refreshUnreadCount } from "../studio/unread-store";
import { commentSourceSignal, commentsSignal, patchLocalComment } from "./comments-store";

const refreshOwnerBadge = (): void => {
  const source = commentSourceSignal.value;
  if (source?.kind === "owner") void refreshUnreadCount(source.projectId);
};

export async function markThreadRead(root: ProjectComment): Promise<void> {
  const source = commentSourceSignal.value;
  if (!source || !root.unread) return;
  patchLocalComment(root.id, { unread: false });
  if (await putThreadRead(source, root.id)) refreshOwnerBadge();
}

export async function markThreadUnread(root: ProjectComment): Promise<void> {
  const source = commentSourceSignal.value;
  if (!source) return;
  patchLocalComment(root.id, { unread: true });
  if (await deleteThreadRead(source, root.id)) refreshOwnerBadge();
}

export async function markAllThreadsRead(): Promise<void> {
  const source = commentSourceSignal.value;
  if (!source) return;
  commentsSignal.value = commentsSignal.value.map((comment) => (comment.unread ? { ...comment, unread: false } : comment));
  if (await putAllThreadsRead(source)) refreshOwnerBadge();
}
