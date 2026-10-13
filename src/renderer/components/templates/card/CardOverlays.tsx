import React from "react";
import { ArrowUpRight, Layers, Lock } from "lucide-react";

const BADGE_BASE =
  "absolute z-10 flex items-center gap-1 rounded-full bg-white/95 px-2 py-[3px] text-[10px] font-semibold text-zinc-900 shadow-sm ring-1 ring-zinc-900/10 dark:bg-zinc-950/85 dark:text-zinc-100 dark:ring-white/15";

export const LockBadge: React.FC = () => (
  <span className={`left-2.5 top-2.5 ${BADGE_BASE}`}>
    <Lock size={10} strokeWidth={2.5} />
    Free with an account
  </span>
);

export const PageCountBadge: React.FC<{ count: number }> = ({ count }) => (
  <span className={`bottom-2.5 right-2.5 ${BADGE_BASE}`}>
    <Layers size={10} strokeWidth={2.5} />
    {count} pages
  </span>
);

export const OpenAffordance: React.FC = () => (
  <span className="absolute right-2.5 top-2.5 flex h-8 w-8 translate-y-1 items-center justify-center rounded-full bg-zinc-900 text-white opacity-0 transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100 dark:bg-white dark:text-zinc-900">
    <ArrowUpRight size={15} strokeWidth={2.5} />
  </span>
);
