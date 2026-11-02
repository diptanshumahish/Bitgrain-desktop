import React from "react";
import { useNavigate } from "react-router-dom";
import { useSignalValue } from "../lib/signal";
import { userSignal } from "../hooks/useAuth";
import { emitModal } from "../lib/event-bus";
import { backendEnabled } from "../lib/api-client";
import { getAvatarGlyph } from "../lib/avatar-glyphs";
import { trackEvent } from "../lib/tracker";

export const UserAvatar: React.FC = () => {
  const user = useSignalValue(userSignal);
  const navigate = useNavigate();

  if (!backendEnabled) return null;

  if (!user) {
    return (
      <button
        onClick={() => {
          trackEvent("auth", "login_modal_open", { details: { trigger: "user_avatar" } });
          emitModal({ type: "login" });
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[11px] font-medium hover:bg-zinc-700 dark:hover:bg-zinc-100 transition-all active:scale-[0.98]"
      >
        Sign in for free
      </button>
    );
  }

  return (
    <button
      onClick={() => {
        trackEvent("nav", "account_link_clicked", { details: { location: "user_avatar" } });
        navigate("/account");
      }}
      title="Account"
      className="flex items-center gap-2 px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all active:scale-[0.98]"
    >
      {user.avatarUrl ? (
        <img src={user.avatarUrl} alt={user.name} className="w-5 h-5 rounded-full object-cover" />
      ) : (
        <div className="w-5 h-5 rounded-[4px] bg-[#F2F4F7] dark:bg-[#0A0A0A] border border-black/5 dark:border-white/5 flex items-center justify-center overflow-hidden shrink-0">
          <pre className="text-[3px] leading-[1] text-zinc-400 dark:text-zinc-600 scale-[1.2]">
            {getAvatarGlyph(user.id)}
          </pre>
        </div>
      )}
      <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 max-w-[80px] truncate">
        {user.name}
      </span>
    </button>
  );
};

