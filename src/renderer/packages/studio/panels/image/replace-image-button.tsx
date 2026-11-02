import React from "react";
import { RefreshCw } from "lucide-react";

interface ReplaceImageButtonProps {
  onClick: () => void;
}

export const ReplaceImageButton: React.FC<ReplaceImageButtonProps> = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center justify-center gap-1.5 w-full h-8 rounded-lg border border-[var(--s-border)] bg-[var(--s-bg-input)] text-[12px] font-semibold text-[var(--s-text)] cursor-pointer transition-colors hover:border-[var(--s-accent)]"
  >
    <RefreshCw size={12} strokeWidth={1.75} />
    Replace image
  </button>
);
