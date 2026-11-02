import React from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import { userSignal } from "@bitgrain/platform/auth/use-auth";
import type { PinDraft } from "../api/share-types";
import { submitComment } from "../comments/comment-actions";
import { commentingModeSignal } from "../comment-state/comment-ui-store";
import { emitCommentPopover } from "../comment-state/comment-popover-events";
import { closeCommentPopover } from "../comment-state/thread-navigation";
import { CommentAvatar } from "../comment-ui/comment-avatar";
import { CommentInput } from "../comment-ui/comment-input";
import { SignInToComment } from "../comment-ui/sign-in-to-comment";
import { DRAFT_PIN_ID, pinSelector } from "../pins/pin-geometry";
import { CommentError } from "./comment-error";
import { PopoverCard } from "./popover-card";

interface ComposerPopoverProps {
  draft: PinDraft;
}

const postDraft = async (draft: PinDraft, body: string): Promise<boolean> => {
  const created = await submitComment({ pageId: draft.pageId, x: draft.x, y: draft.y, body });
  if (!created) return false;
  emitCommentPopover({ kind: "thread", threadId: created.id });
  return true;
};

export const ComposerPopover: React.FC<ComposerPopoverProps> = ({ draft }) => {
  const mode = useSignalValue(commentingModeSignal);
  const user = useSignalValue(userSignal);
  const canWrite = mode === "write" && !!user;
  return (
    <PopoverCard anchorSelector={pinSelector(DRAFT_PIN_ID)} widthClass="w-[300px]" interactive label="New comment">
      <div className="flex items-start gap-2 px-3 py-2.5">
        {canWrite && user ? (
          <>
            <CommentAvatar authorId={user.id} name={user.name} avatarUrl={user.avatarUrl} size="sm" />
            <CommentInput
              key={`${draft.pageId}:${draft.x}:${draft.y}`}
              autoFocus
              placeholder="Add a comment"
              submitLabel="Post comment"
              onSubmit={(body) => postDraft(draft, body)}
              onCancel={closeCommentPopover}
            />
          </>
        ) : (
          <SignInToComment />
        )}
      </div>
      <CommentError />
    </PopoverCard>
  );
};
