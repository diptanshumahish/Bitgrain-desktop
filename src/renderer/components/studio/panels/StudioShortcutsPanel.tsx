import React from "react";
import type { ShortcutGroup, ShortcutItem } from "./studio-shortcuts";

export const ShortcutRow: React.FC<ShortcutItem> = ({ keys, label }) => (
  <div className="flex items-center justify-between gap-3 text-[11px] text-[var(--s-text-muted)]">
    <span className="truncate">{label}</span>
    <kbd className="px-1.5 py-0.5 rounded-md bg-[var(--s-bg-input)] text-[10px] [font-variant-numeric:tabular-nums] text-[var(--s-text-subtle)] shrink-0 border border-[var(--s-border)]">
      {keys}
    </kbd>
  </div>
);

export const ShortcutSection: React.FC<ShortcutGroup> = ({ title, items }) => (
  <div className="flex flex-col gap-2">
    <span className="text-[10px] text-[var(--s-text-subtle)] font-medium">
      {title}
    </span>
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <ShortcutRow key={item.keys + item.label} {...item} />
      ))}
    </div>
  </div>
);
