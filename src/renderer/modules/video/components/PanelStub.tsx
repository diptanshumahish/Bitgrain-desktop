import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PanelStubProps {
  side: "left" | "right";
  label: string;
  onExpand: () => void;
}

// What a collapsed side panel leaves behind: a narrow strip carrying the panel's
// name vertically and a chevron pointing back at where it went. A collapsed panel
// should still be visible and one click from returning, not vanish and leave the
// user hunting a menu.
export const PanelStub: React.FC<PanelStubProps> = ({ side, label, onExpand }) => (
  <button
    onClick={onExpand}
    title={`Show ${label.toLowerCase()}`}
    aria-label={`Show ${label.toLowerCase()}`}
    className={`group flex w-7 shrink-0 flex-col items-center gap-2 bg-[var(--s-bg-panel)] py-2 text-[var(--s-text-subtle)] transition-colors hover:bg-[var(--s-bg-input)] hover:text-[var(--s-text)] ${
      side === "left"
        ? "border-r border-[var(--s-border)]"
        : "border-l border-[var(--s-border)]"
    }`}
  >
    {side === "left" ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
    <span
      className="text-[10px] tracking-wide"
      style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
    >
      {label}
    </span>
  </button>
);
