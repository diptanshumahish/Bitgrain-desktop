import React from "react";
import { Undo2, Redo2, Moon, Sun } from "lucide-react";
import { useSignalValue } from "../../../lib/signal";
import { currentProjectSignal } from "../store/project-store";
import { themeSignal, toggleTheme } from "../../../store/global-theme-store";
import {
  undo,
  redo,
  canUndoSignal,
  canRedoSignal,
} from "../store/video-history-store";
import { EditableTitle } from "./EditableTitle";
import { Tooltip } from "../../../components/studio/ui/Tooltip";

interface IconButtonProps {
  label: string;
  shortcut?: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

const IconButton: React.FC<IconButtonProps> = ({
  label, shortcut, onClick, disabled, children,
}) => {
  const tip = shortcut ? `${label} (${shortcut})` : label;
  return (
    <Tooltip content={tip}>
      <button
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--s-text-muted)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[var(--s-text-muted)] active:scale-95"
      >
        {children}
      </button>
    </Tooltip>
  );
};

// Slim video tool strip. The document tabs and the Export action live in the app
// title bar now; this strip carries only the title/dimensions and the
// edit-history + theme controls, matching the darkroom and studio language.
export const TopBar: React.FC = () => {
  const project = useSignalValue(currentProjectSignal);
  const canUndo = useSignalValue(canUndoSignal);
  const canRedo = useSignalValue(canRedoSignal);
  const theme = useSignalValue(themeSignal);
  const dark = theme === "dark";

  React.useEffect(() => {
    if (!project?.name) return;
    const title = `${project.name}, Bitgrain`;
    document.title = title;
    const timer = setTimeout(() => { document.title = title; }, 50);
    return () => clearTimeout(timer);
  }, [project?.name]);

  return (
    <header className="h-12 shrink-0 flex items-center justify-between px-3 border-b border-[var(--s-border)] bg-[var(--s-bg-panel)]">
      <div className="flex items-center gap-2 min-w-0">
        <EditableTitle />
        {project && (
          <>
            <span className="w-1 h-1 rounded-full bg-[var(--s-text-subtle)] shrink-0" aria-hidden />
            <span className="text-[11px] text-[var(--s-text-subtle)] shrink-0 [font-variant-numeric:tabular-nums]">
              {project.width} × {project.height}
            </span>
            <span className="w-1 h-1 rounded-full bg-[var(--s-text-subtle)] shrink-0" aria-hidden />
            <span className="text-[11px] text-[var(--s-text-subtle)] shrink-0 [font-variant-numeric:tabular-nums]">
              {project.fps} fps
            </span>
          </>
        )}
      </div>

      <div className="flex items-center gap-0.5">
        <IconButton label="Undo" shortcut="⌘Z" disabled={!canUndo} onClick={undo}>
          <Undo2 size={13} strokeWidth={1.75} />
        </IconButton>
        <IconButton label="Redo" shortcut="⌘⇧Z" disabled={!canRedo} onClick={redo}>
          <Redo2 size={13} strokeWidth={1.75} />
        </IconButton>

        <div className="w-px h-4 bg-[var(--s-border)] mx-1.5" />

        <IconButton
          label={dark ? "Switch to light" : "Switch to dark"}
          onClick={toggleTheme}
        >
          {dark ? <Sun size={13} strokeWidth={1.75} /> : <Moon size={13} strokeWidth={1.75} />}
        </IconButton>
      </div>
    </header>
  );
};
