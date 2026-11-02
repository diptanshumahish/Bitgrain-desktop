import React from "react";
import { getAvatarGlyph } from "./avatar-glyphs";
import { hasOAuthAvatar } from "./has-oauth-avatar";

interface UserAvatarProps {
  user: { id: string; name: string; avatarUrl?: string | null };
  showGlyph?: boolean;
  className: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ user, showGlyph = false, className }) => (
  <span
    className={`shrink-0 overflow-hidden flex items-center justify-center bg-[var(--s-bg-input)] text-[var(--s-text-muted)] ${className}`}
  >
    {hasOAuthAvatar(user.avatarUrl) ? (
      <img src={user.avatarUrl ?? ""} alt="" className="w-full h-full object-cover" />
    ) : showGlyph ? (
      <pre className="text-[6px] leading-[1] text-[var(--s-text-subtle)]">{getAvatarGlyph(user.id)}</pre>
    ) : (
      <span className="font-medium">{user.name.charAt(0).toUpperCase()}</span>
    )}
  </span>
);
