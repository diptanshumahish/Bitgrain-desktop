import { createEventChannel } from "@bitgrain/core/events/event-channel";
import type { PinDraft } from "../api/share-types";

export type CommentPopoverRequest =
  | { kind: "thread"; threadId: string }
  | { kind: "composer"; draft: PinDraft };

const COMMENT_POPOVER_EVENT = "bg:comment-popover";
const PIN_PREVIEW_EVENT = "bg:comment-pin-preview";

const commentPopoverChannel = createEventChannel<CommentPopoverRequest | null>(COMMENT_POPOVER_EVENT);
const pinPreviewChannel = createEventChannel<string | null>(PIN_PREVIEW_EVENT);

export const emitCommentPopover = commentPopoverChannel.emit;
export const onCommentPopover = commentPopoverChannel.on;

export const emitPinPreview = pinPreviewChannel.emit;
export const onPinPreview = pinPreviewChannel.on;
