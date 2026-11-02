import React from "react";

interface TemplateCountPillProps {
  total: number;
  isPending: boolean;
  className?: string;
}

const PILL_CLASS =
  "inline-block rounded-full border border-zinc-200 px-3 py-1 text-[12px] font-semibold text-zinc-600 dark:border-zinc-800 dark:text-zinc-300";

export const TemplateCountPill: React.FC<TemplateCountPillProps> = ({ total, isPending, className = PILL_CLASS }) => {
  if (total > 0) {
    return <span className={className}>{total === 1 ? "1 template" : `${total} templates`}</span>;
  }
  if (!isPending) return null;
  return <span className="skeleton-shimmer block h-[26px] w-[110px] rounded-full" />;
};
