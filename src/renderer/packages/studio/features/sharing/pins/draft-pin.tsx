import React from "react";
import { Plus } from "lucide-react";
import { useSignalValue } from "@bitgrain/core/signal";
import { userSignal } from "@bitgrain/platform/auth/use-auth";
import type { PinDraft } from "../api/share-types";
import { CommentAvatar } from "../comment-ui/comment-avatar";
import { CommentPin } from "./comment-pin";
import { DRAFT_PIN_ID } from "./pin-geometry";

interface DraftPinProps {
  draft: PinDraft;
  counterScale: boolean;
}

const PLUS_SIZE = 14;

export const DraftPin: React.FC<DraftPinProps> = ({ draft, counterScale }) => {
  const user = useSignalValue(userSignal);
  return (
    <CommentPin pinId={DRAFT_PIN_ID} x={draft.x} y={draft.y} tone="active" label="New comment" counterScale={counterScale}>
      {user ? (
        <CommentAvatar authorId={user.id} name={user.name} avatarUrl={user.avatarUrl} size="pin" />
      ) : (
        <span className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-neutral-950">
          <Plus size={PLUS_SIZE} strokeWidth={2} />
        </span>
      )}
    </CommentPin>
  );
};
