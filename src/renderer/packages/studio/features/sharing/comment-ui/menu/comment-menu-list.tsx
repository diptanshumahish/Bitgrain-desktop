import React from "react";
import { Check } from "lucide-react";
import { emitPopover } from "@bitgrain/ui/overlays/popover-events";

export interface CommentMenuEntry {
  label: string;
  onSelect: () => void;
  checked?: boolean;
  danger?: boolean;
  separatorBefore?: boolean;
}

const CHECK_SIZE = 12;

const itemTone = (danger: boolean | undefined): string =>
  danger ? "text-red-600 hover:bg-red-500/10" : "text-[var(--s-text)] hover:bg-[var(--s-bg-input)]";

const MenuEntryButton: React.FC<{ entry: CommentMenuEntry; showChecks: boolean }> = ({ entry, showChecks }) => (
  <button
    type="button"
    role="menuitem"
    onClick={() => {
      emitPopover(null);
      entry.onSelect();
    }}
    className={`w-full h-7 flex items-center gap-2 px-2 rounded-md border-none bg-transparent cursor-pointer text-left text-[12px] transition-colors ${itemTone(entry.danger)}`}
  >
    {showChecks && (
      <span className="w-3 shrink-0 flex items-center justify-center">
        {entry.checked && <Check size={CHECK_SIZE} strokeWidth={2} />}
      </span>
    )}
    <span className="flex-1 truncate">{entry.label}</span>
  </button>
);

export const CommentMenu: React.FC<{ entries: CommentMenuEntry[] }> = ({ entries }) => {
  const showChecks = entries.some((entry) => entry.checked !== undefined);
  return (
    <div role="menu" className="min-w-[188px] p-1 flex flex-col rounded-lg border border-[var(--s-border)] bg-[var(--s-bg-panel)] font-editorial">
      {entries.map((entry) => (
        <React.Fragment key={entry.label}>
          {entry.separatorBefore && <div className="h-px my-1 bg-[var(--s-border)]" />}
          <MenuEntryButton entry={entry} showChecks={showChecks} />
        </React.Fragment>
      ))}
    </div>
  );
};
