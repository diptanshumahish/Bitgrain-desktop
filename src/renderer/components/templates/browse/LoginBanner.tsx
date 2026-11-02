import React from "react";
import { emitModal } from "../../../lib/event-bus";
import { trackEvent } from "../../../lib/tracker";

interface LoginBannerProps {
  lockedCount: number;
  total: number;
}

interface BannerCopy {
  title: string;
  body: string;
}

const bannerCopy = (lockedCount: number, total: number): BannerCopy => {
  if (lockedCount > 0 && lockedCount === total) {
    return {
      title: lockedCount === 1 ? "This one opens with a free account" : `All ${total} of these open with a free account`,
      body: "Have a look at the previews, then sign up free to use any of them.",
    };
  }
  if (lockedCount > 0) {
    return {
      title: `${lockedCount} more open with a free account`,
      body: "Free ones work right away. Sign up free to use the rest, save projects and sync credits.",
    };
  }
  return { title: "Sign up free to keep your work", body: "Save projects and keep credits in sync across devices." };
};

const openSignUp = (): void => {
  trackEvent("auth", "login_modal_open", { details: { trigger: "templates_banner" } });
  emitModal({ type: "login", reason: "templates" });
};

export const LoginBanner: React.FC<LoginBannerProps> = ({ lockedCount, total }) => {
  const copy = bannerCopy(lockedCount, total);
  return (
    <div className="mb-10 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-5 dark:border-zinc-700 dark:bg-zinc-900/50">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-200">{copy.title}</p>
          <p className="mt-0.5 text-[12px] text-zinc-500 dark:text-zinc-400">{copy.body}</p>
        </div>
        <button
          type="button"
          onClick={openSignUp}
          className="shrink-0 rounded-xl bg-zinc-900 px-4 py-2 text-[12px] font-semibold text-white transition-all hover:bg-zinc-700 active:scale-[0.98] dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
        >
          Sign up free
        </button>
      </div>
    </div>
  );
};
