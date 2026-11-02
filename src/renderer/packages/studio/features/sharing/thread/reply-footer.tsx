import React from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import { userSignal } from "@bitgrain/platform/auth/use-auth";
import type { CommentThread } from "../api/share-types";
import { submitComment } from "../comments/comment-actions";
import { commentingModeSignal } from "../comment-state/comment-ui-store";
import { closeCommentPopover } from "../comment-state/thread-navigation";
import { CommentAvatar } from "../comment-ui/comment-avatar";
import { CommentInput } from "../comment-ui/comment-input";
import { SignInToComment } from "../comment-ui/sign-in-to-comment";

interface ReplyFooterProps {
  thread: CommentThread;
}

const postReply = async (threadId: string, body: string): Promise<boolean> =>
  (await submitComment({ threadId, body })) !== null;

export const ReplyFooter: React.FC<ReplyFooterProps> = ({ thread }) => {
  const mode = useSignalValue(commentingModeSignal);
  const user = useSignalValue(userSignal);
  if (mode === "off") return null;
  return (
    <footer className="shrink-0 flex items-start gap-2 px-3 py-2.5 border-t border-[var(--s-border)]">
      {mode === "write" && user ? (
        <>
          <CommentAvatar authorId={user.id} name={user.name} avatarUrl={user.avatarUrl} size="sm" />
          <CommentInput
            key={thread.root.id}
            autoFocus
            placeholder="Reply"
            submitLabel="Send reply"
            onSubmit={(body) => postReply(thread.root.id, body)}
            onCancel={closeCommentPopover}
          />
        </>
      ) : (
        <SignInToComment />
      )}
    </footer>
  );
};
