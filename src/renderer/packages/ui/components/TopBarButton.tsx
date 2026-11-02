import React from "react";
import { Tooltip } from "../controls/panel/Tooltip";

interface TopBarButtonProps {
  label: string;
  shortcut?: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  pressed?: boolean;
  text?: string;
  children: React.ReactNode;
}

const BASE_CLASS = "h-8 rounded-lg flex items-center justify-center gap-1.5 transition-colors active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent";
const LABELLED_CLASS = "px-2.5 text-[13px] font-medium whitespace-nowrap";
const ICON_ONLY_CLASS = "w-8";
const IDLE_CLASS = "text-[var(--s-text-muted)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input)]";
const PRESSED_CLASS = "bg-[var(--s-accent-soft)] text-[var(--s-accent)]";

export const TopBarButton: React.FC<TopBarButtonProps> = ({ label, shortcut, onClick, disabled, pressed, text, children }) => (
  <Tooltip side="bottom" content={shortcut ? `${label} (${shortcut})` : label}>
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={pressed}
      className={`${BASE_CLASS} ${text ? LABELLED_CLASS : ICON_ONLY_CLASS} ${pressed ? PRESSED_CLASS : IDLE_CLASS}`}
    >
      {children}
      {text}
    </button>
  </Tooltip>
);
