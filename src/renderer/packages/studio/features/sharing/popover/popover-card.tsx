import React from "react";
import { useFollowAnchor } from "./use-follow-anchor";

interface PopoverCardProps {
  anchorSelector: string;
  widthClass: string;
  interactive: boolean;
  label: string;
  children: React.ReactNode;
}

export const PopoverCard: React.FC<PopoverCardProps> = ({ anchorSelector, widthClass, interactive, label, children }) => {
  const cardRef = useFollowAnchor(anchorSelector);
  return (
    <div
      ref={cardRef}
      role={interactive ? "dialog" : "tooltip"}
      aria-label={label}
      data-comment-popover
      className={`fixed left-0 top-0 z-[9000] invisible flex flex-col rounded-xl border border-[var(--s-border)] bg-[var(--s-bg-panel)] text-[var(--s-text)] font-editorial animate-in fade-in zoom-in-95 duration-100 ${interactive ? "" : "pointer-events-none"} ${widthClass}`}
    >
      {children}
    </div>
  );
};
