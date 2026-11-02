import { emitDialog } from "@bitgrain/ui/dialogs/dialog-events";
import type { CommentThread, ProjectComment } from "../api/share-types";
import { removeComment } from "../comments/comment-actions";
import { markThreadUnread } from "../comments/comment-read-actions";
import { copyCommentLink } from "../comments/comment-link";
import { commentSourceSignal } from "../comments/comments-store";
import { hasOthersComments } from "../comments/group-threads";
import { editingCommentSignal } from "../comment-state/comment-ui-store";
import { closeCommentPopover } from "../comment-state/thread-navigation";
import { openCommentMenu, type CommentMenuEntry } from "../comment-ui/menu/comment-menu";

const confirmDelete = (comment: ProjectComment): void => {
  const isRoot = comment.threadId === null;
  emitDialog({
    type: "confirm",
    title: isRoot ? "Delete this thread?" : "Delete this comment?",
    message: isRoot ? "The comment and every reply in it will be gone for everyone." : "This can't be undone.",
    confirmLabel: "Delete",
    danger: true,
    onConfirm: () => {
      if (isRoot) closeCommentPopover();
      void removeComment(comment);
    },
  });
};

const markUnreadEntry = (thread: CommentThread): CommentMenuEntry => ({
  label: "Mark as unread",
  onSelect: () => {
    closeCommentPopover();
    void markThreadUnread(thread.root);
  },
});

const copyLinkEntry = (thread: CommentThread): CommentMenuEntry => ({
  label: "Copy link to comment",
  onSelect: () => {
    const source = commentSourceSignal.value;
    if (source) void copyCommentLink(source, thread.root.id);
  },
});

export const openThreadMenu = (anchor: HTMLElement, thread: CommentThread, viewerId: string | undefined): void => {
  const entries: CommentMenuEntry[] = [];
  if (viewerId && hasOthersComments(thread, viewerId)) entries.push(markUnreadEntry(thread));
  entries.push(copyLinkEntry(thread));
  if (thread.root.canDelete) {
    entries.push({ label: "Delete thread", danger: true, separatorBefore: true, onSelect: () => confirmDelete(thread.root) });
  }
  openCommentMenu(anchor, entries);
};

export const openCommentRowMenu = (anchor: HTMLElement, comment: ProjectComment): void => {
  const entries: CommentMenuEntry[] = [];
  if (comment.canEdit) {
    entries.push({
      label: "Edit",
      onSelect: () => {
        editingCommentSignal.value = comment.id;
      },
    });
  }
  if (comment.canDelete) entries.push({ label: "Delete", danger: true, onSelect: () => confirmDelete(comment) });
  openCommentMenu(anchor, entries);
};

export const hasRowMenu = (comment: ProjectComment): boolean => comment.canEdit || comment.canDelete;
