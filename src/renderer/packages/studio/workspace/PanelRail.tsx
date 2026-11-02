import React from "react";
import { PanelLeftOpen, PanelRightOpen } from "lucide-react";

interface RailButtonProps {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  danger?: boolean;
}

export const RailButton: React.FC<RailButtonProps> = ({ label, onClick, children, danger }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    className={`w-8 h-8 flex items-center justify-center rounded-md text-[var(--s-text-subtle)] transition-colors ${
      danger
        ? "hover:bg-red-500/10 hover:text-red-500"
        : "hover:bg-[var(--s-bg-input)] hover:text-[var(--s-text)]"
    }`}
  >
    {children}
  </button>
);

interface PanelRailProps {
  side: "left" | "right";
  onExpand: () => void;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

export const PanelRail: React.FC<PanelRailProps> = ({ side, onExpand, children, footer }) => {
  const isLeft = side === "left";
  const ExpandIcon = isLeft ? PanelLeftOpen : PanelRightOpen;

  return (
    <div
      className={`w-11 shrink-0 h-full flex flex-col items-center py-2.5 gap-1 bg-[var(--s-bg-panel)] border-[var(--s-border)] ${
        isLeft ? "border-r" : "border-l animate-panel-in-right"
      }`}
    >
      <RailButton label={`Show ${side} panel`} onClick={onExpand}>
        <ExpandIcon size={16} strokeWidth={1.75} />
      </RailButton>
      {children && <div className="w-5 h-px bg-[var(--s-border)] my-1" />}
      {children}
      <div className="flex-1" />
      {footer}
    </div>
  );
};
