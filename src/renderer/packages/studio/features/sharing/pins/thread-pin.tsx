import React from "react";
import type { CommentThread } from "../api/share-types";
import { CommentAvatar } from "../comment-ui/comment-avatar";
import { authorLabel } from "../comment-ui/author-label";
import { emitPinPreview } from "../comment-state/comment-popover-events";
import { closeCommentPopover, openThread } from "../comment-state/thread-navigation";
import { CommentPin, type PinTone } from "./comment-pin";
import { usePinDrag } from "./use-pin-drag";

interface ThreadPinProps {
  thread: CommentThread;
  active: boolean;
  highlighted: boolean;
  counterScale: boolean;
}

const toneOf = (thread: CommentThread, emphasized: boolean): PinTone => {
  if (emphasized) return "active";
  if (thread.root.resolvedAt !== null) return "resolved";
  return thread.root.unread ? "unread" : "read";
};

export const ThreadPin: React.FC<ThreadPinProps> = ({ thread, active, highlighted, counterScale }) => {
  const { root } = thread;
  const drag = usePinDrag(root, () => (active ? closeCommentPopover() : openThread(thread)));
  const { wrapperRef, ...pointerHandlers } = drag;
  return (
    <CommentPin
      pinId={root.id}
      x={root.x ?? 0}
      y={root.y ?? 0}
      tone={toneOf(thread, active || highlighted)}
      label={`Comment from ${authorLabel(root.authorName)}`}
      counterScale={counterScale}
      wrapperRef={wrapperRef}
      handlers={{
        ...pointerHandlers,
        onPointerEnter: () => {
          if (!active) emitPinPreview(root.id);
        },
        onPointerLeave: () => emitPinPreview(null),
      }}
    >
      <CommentAvatar authorId={root.authorId} name={root.authorName} avatarUrl={root.authorAvatar} size="pin" />
    </CommentPin>
  );
};
