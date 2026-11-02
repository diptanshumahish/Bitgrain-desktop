import type { JsonResult } from "@bitgrain/api/post-json";
import { requestJson } from "./share-request";
import type { CommentPatch, CommentSource, NewComment, ProjectComment } from "./share-types";

interface UnreadPayload {
  count: number;
}

export const commentsPath = (source: CommentSource): string =>
  source.kind === "owner"
    ? `/api/projects/${encodeURIComponent(source.projectId)}/comments`
    : `/api/shared/${encodeURIComponent(source.token)}/comments`;

export async function fetchComments(source: CommentSource): Promise<JsonResult<ProjectComment[]>> {
  return await requestJson<ProjectComment[]>(commentsPath(source));
}

export async function postComment(source: CommentSource, input: NewComment): Promise<JsonResult<ProjectComment>> {
  return await requestJson<ProjectComment>(commentsPath(source), "POST", input);
}

export async function patchComment(
  source: CommentSource,
  commentId: string,
  patch: CommentPatch,
): Promise<JsonResult<ProjectComment>> {
  return await requestJson<ProjectComment>(`${commentsPath(source)}/${commentId}`, "PATCH", patch);
}

export async function deleteComment(source: CommentSource, commentId: string): Promise<JsonResult<{ ok: boolean }>> {
  return await requestJson<{ ok: boolean }>(`${commentsPath(source)}/${commentId}`, "DELETE");
}

export async function fetchUnreadCount(projectId: string): Promise<number> {
  const result = await requestJson<UnreadPayload>(`/api/projects/${encodeURIComponent(projectId)}/comments/unread`);
  return result.data?.count ?? 0;
}
