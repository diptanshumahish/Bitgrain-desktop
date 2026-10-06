import React from "react";
import { Frame } from "lucide-react";

interface MatchPageButtonProps {
  onClick: () => void;
}

export const MatchPageButton: React.FC<MatchPageButtonProps> = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full flex items-center justify-center gap-2 h-[28px] rounded-md border border-[var(--s-border)] bg-[var(--s-bg-input)] text-[var(--s-text-subtle)] text-[11px] font-medium hover:border-[var(--s-accent)] hover:text-[var(--s-text)] transition-colors cursor-pointer"
  >
    <Frame size={12} strokeWidth={1.75} />
    match page to image
  </button>
);
