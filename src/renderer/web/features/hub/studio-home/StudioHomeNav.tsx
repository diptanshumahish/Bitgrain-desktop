import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sun, Moon, BookOpen } from "lucide-react";
import { useSignalValue } from "@bitgrain/core/signal";
import { themeSignal, toggleTheme } from "@bitgrain/ui/theme/global-theme-store";
import { useUser } from "@bitgrain/platform/account/use-user";
import { getPlanLabel } from "./studio-home.constants";
import { emitPlatformModal } from "@bitgrain/platform/modals/platform-modal-events";
import { UserAvatar } from "@bitgrain/platform/account/UserAvatar";
import { SectionLogo } from "../../../app/shell/section-nav/SectionLogo";
import { BackToHubButton } from "../../../app/shell/section-nav/BackToHubButton";
import { usePlanKnown } from "@bitgrain/platform/plans/gate/plan-status";

const NAV_LABEL_CLASS = "whitespace-nowrap text-[11px] font-medium text-zinc-900 dark:text-white";

interface StudioHomeNavProps {
  label: string;
}

export const StudioHomeNav: React.FC<StudioHomeNavProps> = ({ label }) => {
  const navigate = useNavigate();
  const dark = useSignalValue(themeSignal) === "dark";
  const { credits } = useUser();
  const planKnown = usePlanKnown();
  const isFree = credits.plan === "free";

  const openUpgrade = () => emitPlatformModal({ type: "studio-payment" });

  return (
    <nav className="flex items-center justify-between px-4 sm:px-5 h-11 border-b border-zinc-900/10 dark:border-white/10 sticky top-0 z-50 bg-[var(--s-bg-canvas)]/80 md:backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <BackToHubButton />
        <div className="w-px h-4 bg-zinc-900/10 dark:bg-white/10" />
        <SectionLogo label={label} labelClassName={NAV_LABEL_CLASS} />
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {!planKnown ? null : isFree ? (
          <button
            onClick={openUpgrade}
            className="px-2.5 h-7 rounded-md bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[11px] font-medium hover:opacity-90 transition-opacity"
          >
            Upgrade
          </button>
        ) : (
          <button
            onClick={() => navigate("/account")}
            className="max-sm:hidden px-2.5 h-7 rounded-md border border-zinc-900/10 dark:border-white/10 text-[11px] font-medium text-zinc-600 dark:text-zinc-300 hover:border-zinc-900/25 dark:hover:border-white/25 transition-colors"
          >
            {getPlanLabel(credits.plan)}
          </button>
        )}
        <Link
          to="/docs"
          title="Documentation"
          aria-label="Documentation"
          className="max-sm:hidden flex items-center justify-center w-7 h-7 rounded border border-zinc-900/10 dark:border-white/10 text-zinc-500 hover:bg-zinc-900/5 dark:hover:bg-white/5 transition-all no-underline"
        >
          <BookOpen size={10} />
        </Link>
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center w-7 h-7 rounded border border-zinc-900/10 dark:border-white/10 text-zinc-500 hover:bg-zinc-900/5 dark:hover:bg-white/5 transition-all"
          aria-label="Toggle theme"
        >
          {dark ? <Sun size={10} /> : <Moon size={10} />}
        </button>
        <UserAvatar />
      </div>
    </nav>
  );
};
