import { signal } from "@bitgrain/core/signal";
import type { CommentPopoverRequest } from "./comment-popover-events";

export const openCommentPopoverSignal = signal<CommentPopoverRequest | null>(null);
export const pinPreviewSignal = signal<string | null>(null);

export const openThreadId = (request: CommentPopoverRequest | null): string | null =>
  request?.kind === "thread" ? request.threadId : null;

export const isCommentPopoverOpen = (): boolean => openCommentPopoverSignal.value !== null;
