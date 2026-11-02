import { deleteComment, fetchComments, patchComment, postComment } from "../api/comments-api";
import type { NewComment, ProjectComment } from "../api/share-types";
import {
  appendComment,
  commentErrorSignal,
  commentPostingSignal,
  commentSourceSignal,
  commentsLoadingSignal,
  commentsNotSyncedSignal,
  commentsSignal,
  dropComment,
  replaceComment,
} from "./comments-store";

const NOT_FOUND_STATUS = 404;

export async function loadComments(): Promise<void> {
  const source = commentSourceSignal.value;
  if (!source) return;
  commentsLoadingSignal.value = true;
  const result = await fetchComments(source);
  commentsLoadingSignal.value = false;
  if (commentSourceSignal.value !== source) return;
  commentsNotSyncedSignal.value = source.kind === "owner" && result.status === NOT_FOUND_STATUS;
  if (result.ok && result.data) {
    commentsSignal.value = result.data;
    commentErrorSignal.value = null;
    return;
  }
  commentErrorSignal.value = commentsNotSyncedSignal.value ? null : result.error;
}

export async function submitComment(input: NewComment): Promise<ProjectComment | null> {
  const source = commentSourceSignal.value;
  if (!source || commentPostingSignal.value) return null;
  commentPostingSignal.value = true;
  const result = await postComment(source, input);
  commentPostingSignal.value = false;
  if (!result.ok || !result.data) {
    commentErrorSignal.value = result.error;
    return null;
  }
  commentErrorSignal.value = null;
  appendComment(result.data);
  return result.data;
}

export async function toggleThreadResolved(root: ProjectComment): Promise<void> {
  const source = commentSourceSignal.value;
  if (!source) return;
  const result = await patchComment(source, root.id, { resolved: root.resolvedAt === null });
  if (result.ok && result.data) {
    replaceComment(result.data);
    return;
  }
  commentErrorSignal.value = result.error;
}

export async function removeComment(comment: ProjectComment): Promise<boolean> {
  const source = commentSourceSignal.value;
  if (!source) return false;
  const result = await deleteComment(source, comment.id);
  if (result.ok) {
    dropComment(comment);
    return true;
  }
  commentErrorSignal.value = result.error;
  return false;
}
