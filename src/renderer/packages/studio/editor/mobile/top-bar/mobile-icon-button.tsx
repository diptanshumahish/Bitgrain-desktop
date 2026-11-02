import React from "react";

interface MobileIconButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export const MobileIconButton: React.FC<MobileIconButtonProps> = ({ icon, label, onClick, disabled = false }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    className="w-11 h-11 max-[359px]:w-9 shrink-0 flex items-center justify-center rounded-xl text-[var(--s-text)] active:bg-[var(--s-bg-input-hover)] transition-colors disabled:text-[var(--s-text-subtle)] disabled:opacity-50"
  >
    {icon}
  </button>
);
