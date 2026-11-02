import React, { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useSignalValue } from "@bitgrain/core/signal";
import { commentsSignal } from "../comments/comments-store";
import { findThread, groupThreads } from "../comments/group-threads";
import { editingCommentSignal } from "../comment-state/comment-ui-store";
import { onCommentPopover, onPinPreview } from "../comment-state/comment-popover-events";
import { openCommentPopoverSignal, openThreadId, pinPreviewSignal } from "../comment-state/comment-popover-store";
import { closeCommentPopover } from "../comment-state/thread-navigation";
import { ThreadPopover } from "../thread/thread-popover";
import { ComposerPopover } from "./composer-popover";
import { PinPreviewCard } from "./pin-preview-card";
import { usePopoverDismiss } from "./use-popover-dismiss";

const clearPopovers = (): void => {
  openCommentPopoverSignal.value = null;
  pinPreviewSignal.value = null;
  editingCommentSignal.value = null;
};

const useCommentPopoverEvents = (): void => {
  useEffect(() => {
    const stopPopover = onCommentPopover((request) => {
      openCommentPopoverSignal.value = request;
      editingCommentSignal.value = null;
    });
    const stopPreview = onPinPreview((threadId) => {
      pinPreviewSignal.value = threadId;
    });
    return () => {
      stopPopover();
      stopPreview();
      clearPopovers();
    };
  }, []);
};

const OpenPopover: React.FC = () => {
  const request = useSignalValue(openCommentPopoverSignal);
  const comments = useSignalValue(commentsSignal);
  const threads = useMemo(() => groupThreads(comments), [comments]);
  const previewId = useSignalValue(pinPreviewSignal);
  usePopoverDismiss(closeCommentPopover);
  const openThread = request?.kind === "thread" ? findThread(threads, request.threadId) : undefined;
  const previewThread = previewId && previewId !== openThreadId(request) ? findThread(threads, previewId) : undefined;
  return (
    <>
      {openThread && <ThreadPopover thread={openThread} />}
      {request?.kind === "composer" && <ComposerPopover draft={request.draft} />}
      {previewThread && <PinPreviewCard thread={previewThread} />}
    </>
  );
};

export const CommentPopoverPortal: React.FC = () => {
  const request = useSignalValue(openCommentPopoverSignal);
  const previewId = useSignalValue(pinPreviewSignal);
  useCommentPopoverEvents();
  if (!request && !previewId) return null;
  return createPortal(<OpenPopover />, document.body);
};
