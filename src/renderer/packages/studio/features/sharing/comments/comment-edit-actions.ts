import { patchComment } from "../api/comments-api";
import type { ProjectComment } from "../api/share-types";
import { commentErrorSignal, commentSourceSignal, patchLocalComment, replaceComment } from "./comments-store";

export async function editCommentBody(comment: ProjectComment, body: string): Promise<boolean> {
  const source = commentSourceSignal.value;
  if (!source) return false;
  if (body === comment.body) return true;
  const result = await patchComment(source, comment.id, { body });
  if (!result.ok || !result.data) {
    commentErrorSignal.value = result.error;
    return false;
  }
  replaceComment(result.data);
  return true;
}

export async function moveThreadPin(root: ProjectComment, x: number, y: number): Promise<void> {
  const source = commentSourceSignal.value;
  if (!source) return;
  patchLocalComment(root.id, { x, y });
  const result = await patchComment(source, root.id, { x, y });
  if (result.ok && result.data) return;
  patchLocalComment(root.id, { x: root.x, y: root.y });
  commentErrorSignal.value = result.error;
}
