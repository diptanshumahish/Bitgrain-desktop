import React from "react";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import type { MaskLayer } from "../mask/mask-types";

interface MaskHeaderProps {
  mask: MaskLayer;
  onRename: (name: string) => void;
  onToggleVisible: () => void;
  onDelete: () => void;
  onCommit?: () => void;
}

const iconButtonClass =
  "w-8 h-8 shrink-0 flex items-center justify-center rounded-lg border border-[var(--s-border)] bg-[var(--s-bg-input)] cursor-pointer text-[var(--s-text-muted)] hover:text-[var(--s-accent)]";

export const MaskHeader: React.FC<MaskHeaderProps> = ({ mask, onRename, onToggleVisible, onDelete, onCommit }) => (
  <div className="flex items-center gap-1.5">
    <input
      aria-label="mask name"
      value={mask.name}
      onChange={(event) => onRename(event.target.value)}
      onBlur={onCommit}
      className="flex-1 min-w-0 h-8 px-2.5 rounded-lg border border-[var(--s-border)] bg-[var(--s-bg-input)] text-[12px] text-[var(--s-text)] outline-none focus:border-[var(--s-accent)]"
    />
    <button type="button" onClick={onToggleVisible} title={mask.visible ? "hide mask" : "show mask"} aria-label={mask.visible ? "hide mask" : "show mask"} className={iconButtonClass}>
      {mask.visible ? <Eye size={13} /> : <EyeOff size={13} />}
    </button>
    <button type="button" onClick={onDelete} title="delete mask" aria-label="delete mask" className={iconButtonClass}>
      <Trash2 size={13} />
    </button>
  </div>
);
