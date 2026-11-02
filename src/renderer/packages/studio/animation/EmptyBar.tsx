import React from "react";
import { X } from "lucide-react";

interface EmptyBarProps {
  message: string;
  action?: React.ReactNode;
  onClose: () => void;
}

export const EmptyBar: React.FC<EmptyBarProps> = ({
  message,
  action,
  onClose,
}) => (
  <div className="relative shrink-0 border-t border-[var(--s-border)] bg-[var(--s-bg-panel)] font-editorial px-3 h-14 flex items-center justify-center gap-3">
    <span className="text-[12px] text-[var(--s-text-muted)]">{message}</span>
    {action}
    <button
      type="button"
      onClick={onClose}
      aria-label="Close animation"
      className="absolute right-3 w-8 h-8 rounded-md flex items-center justify-center text-[var(--s-text-subtle)] hover:bg-[var(--s-bg-input)] hover:text-[var(--s-text)] transition-colors"
    >
      <X size={15} strokeWidth={1.75} />
    </button>
  </div>
);
