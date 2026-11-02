import React from "react";
import { CheckCircle2, MoreHorizontal, X } from "lucide-react";
import { useSignalValue } from "@bitgrain/core/signal";
import { userSignal } from "@bitgrain/platform/auth/use-auth";
import type { CommentThread } from "../api/share-types";
import { toggleThreadResolved } from "../comments/comment-actions";
import { commentingModeSignal } from "../comment-state/comment-ui-store";
import { closeCommentPopover } from "../comment-state/thread-navigation";
import { IconButton } from "../comment-ui/icon-button";
import { openThreadMenu } from "./thread-menus";

interface ThreadHeaderProps {
  thread: CommentThread;
}

const ICON_SIZE = 15;

export const ThreadHeader: React.FC<ThreadHeaderProps> = ({ thread }) => {
  const viewerId = useSignalValue(userSignal)?.id;
  const canWrite = useSignalValue(commentingModeSignal) === "write";
  const resolved = thread.root.resolvedAt !== null;
  return (
    <header className="h-10 shrink-0 flex items-center gap-0.5 pl-3 pr-1.5 border-b border-[var(--s-border)]">
      <h2 className="flex-1 text-[12px] font-semibold">{resolved ? "Resolved comment" : "Comment"}</h2>
      <IconButton label="More options" onClick={(event) => openThreadMenu(event.currentTarget, thread, viewerId)}>
        <MoreHorizontal size={ICON_SIZE} />
      </IconButton>
      {canWrite && (
        <IconButton
          label={resolved ? "Reopen" : "Mark as resolved"}
          pressed={resolved}
          onClick={() => void toggleThreadResolved(thread.root)}
        >
          <CheckCircle2 size={ICON_SIZE} className={resolved ? "fill-[var(--s-text)] text-[var(--s-bg-panel)]" : ""} />
        </IconButton>
      )}
      <IconButton label="Close" onClick={closeCommentPopover}>
        <X size={ICON_SIZE} />
      </IconButton>
    </header>
  );
};
