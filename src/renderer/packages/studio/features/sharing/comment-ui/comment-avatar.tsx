import React from "react";
import { UserAvatar } from "@bitgrain/ui/avatar/UserAvatar";
import { authorLabel } from "./author-label";

type CommentAvatarSize = "xs" | "sm" | "pin";

interface CommentAvatarProps {
  authorId: string;
  name: string;
  avatarUrl: string | null;
  size: CommentAvatarSize;
}

const SIZE_CLASS: Record<CommentAvatarSize, string> = {
  xs: "w-5 h-5 text-[10px]",
  sm: "w-6 h-6 text-[11px]",
  pin: "w-7 h-7 text-[12px] bg-neutral-200! text-neutral-700!",
};

export const CommentAvatar: React.FC<CommentAvatarProps> = ({ authorId, name, avatarUrl, size }) => (
  <UserAvatar
    user={{ id: authorId, name: authorLabel(name), avatarUrl }}
    className={`rounded-full ${SIZE_CLASS[size]}`}
  />
);
