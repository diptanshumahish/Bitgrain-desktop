import React from "react";
import { ChevronLeft, Undo2, Redo2, Share } from "lucide-react";
import { MobileIconButton } from "./mobile-icon-button";
import { MobileSaveState } from "./mobile-save-state";

interface MobileTopBarProps {
  title: string;
  canUndo: boolean;
  canRedo: boolean;
  onBack: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onExport: () => void;
}

const ICON_SIZE = 20;
const EXPORT_ICON_SIZE = 15;

export const MobileTopBar: React.FC<MobileTopBarProps> = ({ title, canUndo, canRedo, onBack, onUndo, onRedo, onExport }) => (
  <header className="shrink-0 flex items-center gap-1 h-14 pl-1 pr-3 border-b border-[var(--s-border)] bg-[var(--s-bg-panel)]">
    <MobileIconButton icon={<ChevronLeft size={ICON_SIZE} strokeWidth={2} />} label="Back to studio" onClick={onBack} />
    <div className="flex-1 min-w-0 flex flex-col justify-center gap-1 pr-1">
      <span className="truncate text-[14px] font-semibold leading-none text-[var(--s-text)]">{title}</span>
      <MobileSaveState />
    </div>
    <MobileIconButton icon={<Undo2 size={ICON_SIZE} strokeWidth={2} />} label="Undo" onClick={onUndo} disabled={!canUndo} />
    <MobileIconButton icon={<Redo2 size={ICON_SIZE} strokeWidth={2} />} label="Redo" onClick={onRedo} disabled={!canRedo} />
    <button
      type="button"
      onClick={onExport}
      className="ml-1 shrink-0 flex items-center gap-1.5 h-10 px-4 max-[359px]:px-3 rounded-xl bg-[var(--s-accent)] text-[var(--s-accent-text)] text-[13px] font-semibold"
    >
      <Share size={EXPORT_ICON_SIZE} strokeWidth={2.25} />
      Export
    </button>
  </header>
);
