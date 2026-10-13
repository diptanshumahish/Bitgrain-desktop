import React from "react";
import type { LucideIcon } from "lucide-react";

interface SwitchRowProps {
  icon: LucideIcon;
  label: string;
  hint: string;
  checked: boolean;
  onToggle: () => void;
}

const ICON_SIZE = 14;

export const SwitchRow: React.FC<SwitchRowProps> = ({ icon: Icon, label, hint, checked, onToggle }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={onToggle}
    className="flex items-center gap-3 w-full px-3 py-2.5 bg-transparent border-none cursor-pointer text-left font-inherit rounded-xl transition-colors hover:bg-[var(--s-bg-input)]"
  >
    <span
      className={`flex items-center justify-center w-8 h-8 shrink-0 rounded-lg transition-colors ${
        checked ? "bg-[var(--s-accent)] text-[var(--s-accent-text)]" : "bg-[var(--s-bg-input)] text-[var(--s-text-muted)]"
      }`}
    >
      <Icon size={ICON_SIZE} strokeWidth={1.75} />
    </span>
    <span className="flex flex-col gap-0.5 flex-1 min-w-0">
      <span className="text-[12px] font-medium text-[var(--s-text)]">{label}</span>
      <span className="text-[10.5px] leading-snug text-[var(--s-text-subtle)]">{hint}</span>
    </span>
    <span
      className={`relative w-8 h-[18px] shrink-0 rounded-full transition-colors ${
        checked ? "bg-[var(--s-accent)]" : "bg-[var(--s-border)]"
      }`}
    >
      <span
        className={`absolute top-[2px] left-[2px] w-[14px] h-[14px] rounded-full transition-transform ${
          checked ? "translate-x-[14px] bg-[var(--s-accent-text)]" : "translate-x-0 bg-white"
        }`}
      />
    </span>
  </button>
);
