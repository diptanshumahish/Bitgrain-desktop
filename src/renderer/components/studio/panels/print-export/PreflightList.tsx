import React from "react";
import { AlertTriangle, CheckCircle2, Info, Loader, XCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PreflightItem, PreflightLevel } from "../../hooks/export/print/preflight/preflight-types";

interface PreflightListProps {
  items: PreflightItem[] | null;
}

const ICON_SIZE = 11;

const LEVEL_ICON: Record<PreflightLevel, LucideIcon> = {
  pass: CheckCircle2,
  info: Info,
  warn: AlertTriangle,
  fail: XCircle,
};

const LEVEL_COLOR: Record<PreflightLevel, string> = {
  pass: "text-emerald-500",
  info: "text-[var(--s-text-subtle)]",
  warn: "text-amber-500",
  fail: "text-red-500",
};

const PreflightRow: React.FC<{ item: PreflightItem }> = ({ item }) => {
  const Icon = LEVEL_ICON[item.level];
  return (
    <li className="flex items-start gap-1.5">
      <Icon size={ICON_SIZE} strokeWidth={2} className={`mt-[1px] shrink-0 ${LEVEL_COLOR[item.level]}`} />
      <span className="text-[10px] leading-snug text-[var(--s-text-muted)]">{item.message}</span>
    </li>
  );
};

export const PreflightList: React.FC<PreflightListProps> = ({ items }) => {
  if (!items) {
    return (
      <div className="flex items-center gap-1.5 px-1 text-[10px] text-[var(--s-text-subtle)]">
        <Loader size={ICON_SIZE} className="animate-spin" />
        Checking your pages for print
      </div>
    );
  }
  return (
    <ul className="flex flex-col gap-1.5 px-1 m-0 list-none">
      {items.map((item) => (
        <PreflightRow key={item.id} item={item} />
      ))}
    </ul>
  );
};
