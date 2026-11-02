import React from "react";
import { StudioDialogShell } from "@bitgrain/ui/dialogs/StudioDialogShell";
import { ALL_SHORTCUT_GROUPS } from "../../panels/studio-shortcuts";
import { ShortcutSection } from "../../panels/StudioShortcutsPanel";

interface KeyboardShortcutsModalProps {
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ onClose }) => (
  <StudioDialogShell
    title="Keyboard shortcuts"
    description="Work faster in Studio. Shortcuts pause while you are typing in a text box."
    widthClass="max-w-2xl"
    onClose={onClose}
  >
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {ALL_SHORTCUT_GROUPS.map((group) => (
        <ShortcutSection key={group.title} {...group} />
      ))}
    </div>
  </StudioDialogShell>
);
