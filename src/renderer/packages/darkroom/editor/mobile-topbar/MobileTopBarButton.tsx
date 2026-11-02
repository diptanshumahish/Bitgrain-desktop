import React from "react";

interface MobileTopBarButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export const MobileTopBarButton: React.FC<MobileTopBarButtonProps> = ({ label, onClick, disabled, children }) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    onClick={onClick}
    disabled={disabled}
    className="w-11 h-11 shrink-0 flex items-center justify-center rounded-full text-[var(--s-text-muted)] transition-colors active:bg-[var(--s-bg-input-hover)] disabled:opacity-30"
  >
    {children}
  </button>
);
