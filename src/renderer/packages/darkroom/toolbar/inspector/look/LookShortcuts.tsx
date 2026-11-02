import React from "react";
import { LayoutTemplate } from "lucide-react";
import { SurpriseButton } from "../../../styles/ui/SurpriseButton";
import type { ToolbarState } from "../../use-toolbar-state";
import type { ActivePopover } from "../../toolbar-types";
import { ensureStyleMode } from "./look-actions";
import { ActiveColourNotes } from "./ActiveColourNotes";

interface LookShortcutsProps {
  state: ToolbarState;
  toggle: (key: ActivePopover) => void;
}

export const LookShortcuts: React.FC<LookShortcutsProps> = ({ state, toggle }) => {
  const surprise = (): void => {
    ensureStyleMode();
    state.onDone();
  };
  return (
    <>
      <div className="flex items-center justify-between px-1">
        <SurpriseButton onCommit={surprise} />
        <button type="button" onClick={() => toggle("presets")}
          className="inline-flex items-center gap-1 h-6 px-2 rounded-md text-[12px] font-medium text-[var(--s-text-muted)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input-hover)] transition-colors">
          <LayoutTemplate size={11} />
          Presets
        </button>
      </div>
      <ActiveColourNotes state={state} />
    </>
  );
};
