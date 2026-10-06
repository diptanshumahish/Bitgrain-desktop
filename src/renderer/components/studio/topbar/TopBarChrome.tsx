import React from "react";
import { Undo2, Redo2, Sun, Moon } from "lucide-react";
import { Tooltip } from "../ui/Tooltip";

interface ChromeButtonProps {
  label: string;
  shortcut?: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const ChromeButton: React.FC<ChromeButtonProps> = ({ label, shortcut, disabled, onClick, children }) => (
  <Tooltip content={shortcut ? `${label} (${shortcut})` : label}>
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="w-7 h-7 flex items-center justify-center rounded-md text-[var(--s-text-muted)] bg-transparent border-none cursor-pointer transition-all duration-150 hover:bg-[var(--s-bg-input)] hover:text-[var(--s-text)] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[var(--s-text-muted)]"
    >
      {children}
    </button>
  </Tooltip>
);

interface TopBarChromeProps {
  canUndo: boolean;
  canRedo: boolean;
  dark: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onToggleDark: () => void;
}

export const TopBarChrome: React.FC<TopBarChromeProps> = ({
  canUndo, canRedo, dark, onUndo, onRedo, onToggleDark,
}) => {
  return (
    <div className="flex items-center gap-0.5">
      <ChromeButton label="Undo" shortcut="⌘Z" disabled={!canUndo} onClick={onUndo}>
        <Undo2 size={13} strokeWidth={1.75} />
      </ChromeButton>
      <ChromeButton label="Redo" shortcut="⌘⇧Z" disabled={!canRedo} onClick={onRedo}>
        <Redo2 size={13} strokeWidth={1.75} />
      </ChromeButton>
      <div className="w-px h-4 bg-[var(--s-border)] mx-1.5" />
      <ChromeButton
        label={dark ? "Switch to light" : "Switch to dark"}
        onClick={onToggleDark}
      >
        {dark ? <Sun size={13} strokeWidth={1.75} /> : <Moon size={13} strokeWidth={1.75} />}
      </ChromeButton>
    </div>
  );
};
