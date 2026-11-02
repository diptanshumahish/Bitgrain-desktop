import React from "react";
import type { CommentThread } from "../api/share-types";
import { formatCommentTime, formatReplyCount } from "../comments/format-comment-time";
import { CommentAvatar } from "../comment-ui/comment-avatar";
import { authorLabel } from "../comment-ui/author-label";
import { pinSelector } from "../pins/pin-geometry";
import { PopoverCard } from "./popover-card";

interface PinPreviewCardProps {
  thread: CommentThread;
}

export const PinPreviewCard: React.FC<PinPreviewCardProps> = ({ thread }) => {
  const { root, replies } = thread;
  return (
    <PopoverCard anchorSelector={pinSelector(root.id)} widthClass="w-[248px]" interactive={false} label="Comment preview">
      <div className="flex flex-col gap-1 px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <CommentAvatar authorId={root.authorId} name={root.authorName} avatarUrl={root.authorAvatar} size="xs" />
          <span className="text-[12px] font-semibold truncate">{authorLabel(root.authorName)}</span>
          <span className="text-[11px] text-[var(--s-text-subtle)] shrink-0">{formatCommentTime(root.createdAt)}</span>
        </div>
        <p className="text-[12.5px] leading-[18px] line-clamp-2 break-words">{root.body}</p>
        {replies.length > 0 && (
          <span className="text-[11px] text-[var(--s-text-subtle)]">{formatReplyCount(replies.length)}</span>
        )}
      </div>
    </PopoverCard>
  );
};
