import React from "react";
import { MoreHorizontal } from "lucide-react";
import { useSignalValue } from "@bitgrain/core/signal";
import type { ProjectComment } from "../api/share-types";
import { editCommentBody } from "../comments/comment-edit-actions";
import { formatCommentTime } from "../comments/format-comment-time";
import { editingCommentSignal } from "../comment-state/comment-ui-store";
import { CommentAvatar } from "../comment-ui/comment-avatar";
import { authorLabel } from "../comment-ui/author-label";
import { CommentInput } from "../comment-ui/comment-input";
import { IconButton } from "../comment-ui/icon-button";
import { hasRowMenu, openCommentRowMenu } from "./thread-menus";

interface ThreadCommentRowProps {
  comment: ProjectComment;
}

const MENU_ICON_SIZE = 14;

const stopEditing = (): void => {
  editingCommentSignal.value = null;
};

const saveEdit = async (comment: ProjectComment, body: string): Promise<boolean> => {
  const saved = await editCommentBody(comment, body);
  if (saved) stopEditing();
  return false;
};

const EditBox: React.FC<{ comment: ProjectComment }> = ({ comment }) => (
  <div className="mt-1 rounded-lg border border-[var(--s-border-focus)] px-2 py-1.5">
    <CommentInput
      autoFocus
      placeholder="Edit comment"
      submitLabel="Save"
      initialValue={comment.body}
      onSubmit={(body) => saveEdit(comment, body)}
      onCancel={stopEditing}
      editing
    />
  </div>
);

export const ThreadCommentRow: React.FC<ThreadCommentRowProps> = ({ comment }) => {
  const editingId = useSignalValue(editingCommentSignal);
  const editing = editingId === comment.id;
  return (
    <div className="group flex gap-2 px-3 py-2">
      <CommentAvatar authorId={comment.authorId} name={comment.authorName} avatarUrl={comment.authorAvatar} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="h-6 flex items-center gap-1.5">
          <span className="text-[12px] font-semibold truncate">{authorLabel(comment.authorName)}</span>
          <span className="text-[11px] text-[var(--s-text-subtle)] shrink-0">{formatCommentTime(comment.createdAt)}</span>
          {comment.editedAt && <span className="text-[11px] text-[var(--s-text-subtle)] shrink-0">(edited)</span>}
          {hasRowMenu(comment) && !editing && (
            <IconButton
              label="Comment options"
              className="ml-auto -mr-1 w-6 h-6 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
              onClick={(event) => openCommentRowMenu(event.currentTarget, comment)}
            >
              <MoreHorizontal size={MENU_ICON_SIZE} />
            </IconButton>
          )}
        </div>
        {editing ? (
          <EditBox comment={comment} />
        ) : (
          <p className="text-[12.5px] leading-[18px] whitespace-pre-wrap break-words">{comment.body}</p>
        )}
      </div>
    </div>
  );
};
