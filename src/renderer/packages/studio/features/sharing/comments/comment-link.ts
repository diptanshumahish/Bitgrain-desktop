import { emitStatusToast } from "@bitgrain/ui/overlays/status-toast/status-toast-events";
import type { CommentSource } from "../api/share-types";

const COMMENT_PARAM = "comment";

const basePath = (source: CommentSource): string =>
  source.kind === "owner"
    ? `/studio/edit/${encodeURIComponent(source.projectId)}`
    : `/s/${encodeURIComponent(source.token)}`;

const commentLink = (source: CommentSource, threadId: string): string =>
  `${window.location.origin}${basePath(source)}?${COMMENT_PARAM}=${encodeURIComponent(threadId)}`;

export const linkedThreadId = (): string | null => new URLSearchParams(window.location.search).get(COMMENT_PARAM);

export async function copyCommentLink(source: CommentSource, threadId: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(commentLink(source, threadId));
    emitStatusToast({ title: "Link copied", detail: "It opens straight to this comment." });
  } catch (error) {
    console.error("clipboard write failed:", error);
    emitStatusToast({ title: "We couldn't copy the link.", detail: "Your browser blocked clipboard access." });
  }
}
