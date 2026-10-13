import React from "react";
import { ChevronLeft } from "lucide-react";
import type { PopoverBack } from "./popover-back-context";

interface PopoverBackRowProps {
  back: PopoverBack;
}

export const PopoverBackRow: React.FC<PopoverBackRowProps> = ({ back }) => (
  <button
    type="button"
    onClick={back.onBack}
    className="flex w-full items-center gap-1 px-3 h-9 text-[12px] font-medium text-[var(--s-text-muted)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input-hover)] border-b border-[var(--s-border)] transition-colors"
  >
    <ChevronLeft size={14} strokeWidth={2} />
    {back.label}
  </button>
);
