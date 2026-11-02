import React, { useLayoutEffect, useRef } from "react";
import type { CommentThread } from "../api/share-types";
import { CommentError } from "../popover/comment-error";
import { PopoverCard } from "../popover/popover-card";
import { pinSelector } from "../pins/pin-geometry";
import { ReplyFooter } from "./reply-footer";
import { ThreadCommentRow } from "./thread-comment-row";
import { ThreadHeader } from "./thread-header";

interface ThreadPopoverProps {
  thread: CommentThread;
}

export const ThreadPopover: React.FC<ThreadPopoverProps> = ({ thread }) => {
  const listRef = useRef<HTMLDivElement>(null);
  const commentCount = thread.replies.length + 1;

  useLayoutEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [commentCount, thread.root.id]);

  return (
    <PopoverCard
      anchorSelector={pinSelector(thread.root.id)}
      widthClass="w-[300px] max-h-[min(480px,calc(100vh-16px))]"
      interactive
      label="Comment thread"
    >
      <ThreadHeader thread={thread} />
      <div ref={listRef} className="flex-1 min-h-0 overflow-y-auto py-1">
        {[thread.root, ...thread.replies].map((comment) => (
          <ThreadCommentRow key={comment.id} comment={comment} />
        ))}
      </div>
      <CommentError />
      <ReplyFooter thread={thread} />
    </PopoverCard>
  );
};
