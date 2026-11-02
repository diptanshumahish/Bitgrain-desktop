import React from "react";
import { Hourglass, RefreshCw } from "lucide-react";
import { useSignalValue } from "@bitgrain/core/signal";
import { templatesNetworkSignal } from "@bitgrain/platform/templates/store/templates-network";
import { retryTemplates } from "@bitgrain/platform/templates/store/templates-store";
import { NETWORK_NOTICE_COPY, RETRY_LABEL } from "./network-notice-copy";
import { Button } from "@bitgrain/ui/components/Button";

type NoticeTheme = "site" | "gallery" | "studio";

interface ThemeClasses {
  box: string;
  title: string;
  body: string;
  icon: string;
}

const THEME_CLASSES: Record<NoticeTheme, ThemeClasses> = {
  site: {
    box: "rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900",
    title: "text-[15px] font-semibold text-zinc-900 dark:text-zinc-100",
    body: "text-[14px]   text-zinc-600 dark:text-zinc-400",
    icon: "text-zinc-500 dark:text-zinc-400",
  },
  gallery: {
    box: "rounded-md border border-white/10 bg-white/[0.04] p-5",
    title: "text-[16px] font-semibold text-white",
    body: "text-[14px]   text-white/60",
    icon: "text-white/60",
  },
  studio: {
    box: "rounded-lg border border-[var(--s-border)] p-3",
    title: "text-[12px] font-semibold text-[var(--s-text)]",
    body: "text-[11px]   text-[var(--s-text-muted)]",
    icon: "text-[var(--s-text-muted)]",
  },
};

interface TemplatesNetworkNoticeProps {
  theme: NoticeTheme;
  className?: string;
}

export const TemplatesNetworkNotice: React.FC<TemplatesNetworkNoticeProps> = ({ theme, className = "" }) => {
  const state = useSignalValue(templatesNetworkSignal);
  if (state === "ok") return null;

  const copy = NETWORK_NOTICE_COPY[state];
  const classes = THEME_CLASSES[theme];
  const Icon = state === "failed" ? RefreshCw : Hourglass;

  return (
    <div role="status" className={`flex items-start gap-3 ${classes.box} ${className}`}>
      <Icon size={18} className={`mt-0.5 shrink-0 ${classes.icon}`} />
      <div className="flex min-w-0 flex-col items-start gap-1.5">
        <p className={classes.title}>{copy.title}</p>
        <p className={classes.body}>{copy.body}</p>
        {state === "failed" && (
          <Button variant="primary" size="sm" onClick={() => void retryTemplates()} className="mt-2">
            {RETRY_LABEL}
          </Button>
        )}
      </div>
    </div>
  );
};
