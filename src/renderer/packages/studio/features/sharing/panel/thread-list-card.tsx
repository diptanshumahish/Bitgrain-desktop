import React from "react";
import { CheckCircle2 } from "lucide-react";
import type { CommentThread } from "../api/share-types";
import { formatCommentTime, formatReplyCount } from "../comments/format-comment-time";
import { hoveredThreadSignal } from "../comment-state/comment-ui-store";
import { focusThread } from "../comment-state/thread-focus";
import { CommentAvatar } from "../comment-ui/comment-avatar";
import { authorLabel } from "../comment-ui/author-label";

interface ThreadListCardProps {
  thread: CommentThread;
  pageName: string;
  active: boolean;
}

const RESOLVED_ICON_SIZE = 13;

const setHovered = (threadId: string | null): void => {
  hoveredThreadSignal.value = threadId;
};

const StatusMark: React.FC<{ thread: CommentThread }> = ({ thread }) => {
  if (thread.root.resolvedAt !== null) {
    return <CheckCircle2 size={RESOLVED_ICON_SIZE} aria-label="Resolved" className="ml-auto shrink-0 text-[var(--s-text-muted)]" />;
  }
  if (!thread.root.unread) return null;
  return <span aria-label="Unread" className="ml-auto w-2 h-2 shrink-0 rounded-full bg-[var(--s-accent)]" />;
};

export const ThreadListCard: React.FC<ThreadListCardProps> = ({ thread, pageName, active }) => {
  const { root, replies } = thread;
  const resolved = root.resolvedAt !== null;
  return (
    <button
      type="button"
      onClick={() => focusThread(thread)}
      onMouseEnter={() => setHovered(root.id)}
      onMouseLeave={() => setHovered(null)}
      className={`w-full flex gap-2 px-3 py-3 text-left border-none cursor-pointer select-none transition-colors ${active ? "bg-[var(--s-accent-soft)]" : "bg-transparent hover:bg-[var(--s-bg-panel-alt)]"}`}
    >
      <span className={resolved ? "opacity-60" : ""}>
        <CommentAvatar authorId={root.authorId} name={root.authorName} avatarUrl={root.authorAvatar} size="sm" />
      </span>
      <span className={`flex-1 min-w-0 flex flex-col ${resolved ? "opacity-60" : ""}`}>
        <span className="h-6 flex items-center gap-1.5">
          <span className={`text-[12px] truncate text-[var(--s-text)] ${root.unread ? "font-bold" : "font-semibold"}`}>{authorLabel(root.authorName)}</span>
          <span className="text-[11px] text-[var(--s-text-subtle)] shrink-0">{formatCommentTime(root.createdAt)}</span>
          <StatusMark thread={thread} />
        </span>
        <span className="text-[11px] text-[var(--s-text-subtle)] truncate">{pageName}</span>
        <span className="mt-1 text-[12.5px] leading-[18px] text-[var(--s-text)] line-clamp-3 break-words whitespace-pre-line">{root.body}</span>
        {replies.length > 0 && (
          <span className="mt-1.5 text-[11px] font-medium text-[var(--s-text-muted)]">{formatReplyCount(replies.length)}</span>
        )}
      </span>
    </button>
  );
};
