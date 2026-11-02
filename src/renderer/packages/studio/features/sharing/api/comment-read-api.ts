import { commentsPath } from "./comments-api";
import { requestJson } from "./share-request";
import type { CommentSource } from "./share-types";

export async function putThreadRead(source: CommentSource, threadId: string): Promise<boolean> {
  return (await requestJson<{ ok: boolean }>(`${commentsPath(source)}/${threadId}/read`, "POST")).ok;
}

export async function deleteThreadRead(source: CommentSource, threadId: string): Promise<boolean> {
  return (await requestJson<{ ok: boolean }>(`${commentsPath(source)}/${threadId}/read`, "DELETE")).ok;
}

export async function putAllThreadsRead(source: CommentSource): Promise<boolean> {
  return (await requestJson<{ count: number }>(`${commentsPath(source)}/read`, "POST")).ok;
}
