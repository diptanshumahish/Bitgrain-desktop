import React from "react";

interface MobileUtilButtonProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export const MobileUtilButton: React.FC<MobileUtilButtonProps> = ({ icon, label, active, disabled, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    aria-pressed={active}
    className={`shrink-0 min-w-[52px] min-h-[48px] px-1.5 flex flex-col items-center justify-center gap-1 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
      active
        ? "text-[var(--s-accent)] bg-[var(--s-accent-soft)]"
        : "text-[var(--s-text-muted)] active:bg-[var(--s-bg-input-hover)]"
    }`}
  >
    {icon}
    <span aria-hidden="true" className="block text-[12px] leading-none whitespace-nowrap first-letter:uppercase">{label}</span>
  </button>
);
