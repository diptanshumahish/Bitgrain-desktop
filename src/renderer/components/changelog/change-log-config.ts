import { Star, Wrench, Zap, Megaphone, RefreshCw, Package, BookOpen, Gauge, Palette, GitMerge } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ChangeLogType } from "../../data/change-log";

export interface ChangeLogTypeStyle {
  label: string;
  icon: LucideIcon;
  badge: string;
}

export const CHANGE_LOG_TYPE_STYLES: Record<ChangeLogType, ChangeLogTypeStyle> = {
  feature: {
    label: "New",
    icon: Star,
    badge: "bg-emerald-300 text-black",
  },
  fix: {
    label: "Fixed",
    icon: Wrench,
    badge: "bg-red-300 text-black",
  },
  improvement: {
    label: "Improved",
    icon: Zap,
    badge: "bg-blue-300 text-black",
  },
  announcement: {
    label: "Release",
    icon: Megaphone,
    badge: "bg-violet-300 text-black",
  },
  refactor: {
    label: "Refactor",
    icon: RefreshCw,
    badge: "bg-amber-300 text-black",
  },
  chore: {
    label: "Chore",   
    icon: Package,
    badge: "bg-stone-300 text-black",
  },
  docs: {
    label: "Docs",
    icon: BookOpen,
    badge: "bg-cyan-300 text-black",
  },
  perf: {
    label: "Perf",
    icon: Gauge,
    badge: "bg-fuchsia-300 text-black",
  },
  style: {
    label: "Style",
    icon: Palette,
    badge: "bg-rose-300 text-black",
  },
  merge: {
    label: "Merge",
    icon: GitMerge,
    badge: "bg-teal-300 text-black",
  },
};

export const CHANGE_LOG_TYPE_ORDER: ChangeLogType[] = [
  "announcement",
  "feature",
  "improvement",
  "fix",
  "perf",
  "refactor",
  "style",
  "docs",
  "chore",
  "merge",
];

export function formatChangeLogDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
