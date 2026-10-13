import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sun, Moon } from "lucide-react";
import { useSignalValue } from "../../../lib/signal";
import { themeSignal, toggleTheme } from "../../../store/global-theme-store";
import { UserAvatar } from "../../UserAvatar";

type NavVariant = "solid" | "overlay";

interface TemplatesNavProps {
  backTo: string;
  backLabel: string;
  variant?: NavVariant;
}

const NAV_CLASS: Record<NavVariant, string> = {
  solid:
    "sticky top-0 z-10 border-b border-zinc-200 bg-brand-primary/90 backdrop-blur-xl dark:border-[#27272a] dark:bg-[#09090b]/90",
  overlay: "absolute inset-x-0 top-0 z-20 bg-transparent",
};

const BACK_CLASS: Record<NavVariant, string> = {
  solid: "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200",
  overlay: "text-zinc-700 hover:text-zinc-900",
};

const TOGGLE_CLASS: Record<NavVariant, string> = {
  solid:
    "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-600",
  overlay:
    "border-zinc-900/15 bg-white/50 text-zinc-700 hover:bg-white/80",
};

const STUDIO_CLASS: Record<NavVariant, string> = {
  solid:
    "bg-zinc-200 text-zinc-600 hover:bg-zinc-300 hover:text-zinc-900 dark:bg-[#27272a] dark:text-[#a1a1aa] dark:hover:bg-[#3f3f46] dark:hover:text-zinc-200",
  overlay: "bg-zinc-900/10 text-zinc-800 hover:bg-zinc-900/20",
};

export const TemplatesNav: React.FC<TemplatesNavProps> = ({
  backTo,
  backLabel,
  variant = "solid",
}) => {
  const navigate = useNavigate();
  const isDark = useSignalValue(themeSignal) === "dark";

  return (
    <nav
      className={`flex h-14 items-center justify-between px-6 transition-colors duration-200 md:px-8 ${NAV_CLASS[variant]}`}
    >
      <button
        type="button"
        onClick={() => navigate(backTo)}
        className={`flex items-center gap-1.5 border-none bg-transparent py-1 text-[13px] font-medium transition-colors ${BACK_CLASS[variant]}`}
      >
        <ArrowLeft size={14} strokeWidth={2.5} />
        {backLabel}
      </button>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all ${TOGGLE_CLASS[variant]}`}
        >
          {isDark ? (
            <Sun size={14} strokeWidth={2} />
          ) : (
            <Moon size={14} strokeWidth={2} />
          )}
        </button>
        <UserAvatar />
        <button
          type="button"
          onClick={() => navigate("/studio")}
          className={`rounded-md border-none px-3.5 py-1.5 text-[11px] font-semibold transition-all ${STUDIO_CLASS[variant]}`}
        >
          Studio home
        </button>
      </div>
    </nav>
  );
};
