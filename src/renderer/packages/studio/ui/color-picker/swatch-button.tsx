import React from "react";

interface SwatchButtonProps {
  color: string;
  active: boolean;
  title?: string;
  onClick: () => void;
}

export const SwatchButton: React.FC<SwatchButtonProps> = ({ color, active, title, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    title={title ?? color}
    aria-label={title ?? color}
    className={`w-full aspect-square rounded-[5px] cursor-pointer border transition-transform duration-100 hover:scale-110 active:scale-95 ${
      active ? "border-[var(--s-accent)] ring-2 ring-[var(--s-accent)] ring-offset-1 ring-offset-[var(--s-bg-panel)]" : "border-[var(--s-border)]"
    }`}
    style={{ background: color }}
  />
);
