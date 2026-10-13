import React from "react";
import { EyeOff } from "lucide-react";
import { emitModal } from "../../../lib/event-bus";

interface RemoveWatermarkRowProps {
  onClose: () => void;
}

export const RemoveWatermarkRow: React.FC<RemoveWatermarkRowProps> = ({ onClose }) => (
  <button
    type="button"
    onClick={() => {
      emitModal({ type: "upgrade-prompt", feature: "watermark" });
      onClose();
    }}
    className="group flex items-center gap-2 px-2 h-8 rounded-md text-[12px] text-[var(--s-text-muted)] hover:bg-[var(--s-accent-soft)] hover:text-[var(--s-accent)] transition-colors"
  >
    <EyeOff size={12} strokeWidth={1.6} className="text-[var(--s-accent)]" />
    Remove the watermark
    <span className="ml-auto text-[12px] text-[var(--s-text-subtle)] group-hover:text-[var(--s-accent)]">Pro</span>
  </button>
);
