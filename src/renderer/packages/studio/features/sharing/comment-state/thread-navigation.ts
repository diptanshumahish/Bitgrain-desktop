import type { CommentThread, PinDraft } from "../api/share-types";
import { markThreadRead } from "../comments/comment-read-actions";
import { emitCommentPopover, emitPinPreview } from "./comment-popover-events";

export const openThread = (thread: CommentThread): void => {
  emitPinPreview(null);
  emitCommentPopover({ kind: "thread", threadId: thread.root.id });
  void markThreadRead(thread.root);
};

export const startDraft = (draft: PinDraft): void => {
  emitPinPreview(null);
  emitCommentPopover({ kind: "composer", draft });
};

export const closeCommentPopover = (): void => emitCommentPopover(null);
