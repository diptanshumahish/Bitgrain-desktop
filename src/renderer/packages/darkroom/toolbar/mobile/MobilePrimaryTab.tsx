import React from "react";

interface MobilePrimaryTabProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export const MobilePrimaryTab: React.FC<MobilePrimaryTabProps> = ({ icon, label, active, disabled, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`w-full flex flex-col items-center justify-center gap-1 min-h-[52px] rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
      active
        ? "bg-[var(--s-accent-soft)] text-[var(--s-accent)]"
        : "text-[var(--s-text-muted)] active:bg-[var(--s-bg-input-hover)]"
    }`}
  >
    {icon}
    <span className="block text-[12px] font-medium leading-none first-letter:uppercase">{label}</span>
  </button>
);
