import React from "react";
import type { TextLayer } from "@bitgrain/studio-core/model/studio-types";
import { MobileSheet } from "../sheet-chrome/mobile-sheet";
import { editableText, textEditUpdates } from "./apply-text-edit";
import { useKeyboardInset } from "./use-keyboard-inset";

interface MobileTextSheetProps {
  layer: TextLayer;
  onUpdate: (updates: Partial<TextLayer>) => void;
  onClose: () => void;
}

const TEXTAREA_ROWS = 4;

export const MobileTextSheet: React.FC<MobileTextSheetProps> = ({ layer, onUpdate, onClose }) => {
  useKeyboardInset();

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
    onUpdate(textEditUpdates(layer, event.target.value));
  };

  const doneButton = (
    <button
      type="button"
      onClick={onClose}
      className="h-10 px-4 mr-2 rounded-xl bg-[var(--s-accent)] text-[var(--s-accent-text)] text-[13px] font-semibold"
    >
      Done
    </button>
  );

  return (
    <MobileSheet
      title="Edit text"
      onClose={onClose}
      dimmed={false}
      hideClose
      headerAction={doneButton}
      placement="above-keyboard"
    >
      <div className="px-4 pb-4">
        <textarea
          autoFocus
          value={editableText(layer)}
          onChange={handleChange}
          rows={TEXTAREA_ROWS}
          enterKeyHint="enter"
          className="w-full rounded-xl border border-[var(--s-border)] bg-[var(--s-bg-input)] px-3.5 py-3 text-[16px] leading-snug text-[var(--s-text)] outline-none focus:border-[var(--s-text-muted)] resize-none"
          placeholder="Type your text"
        />
      </div>
    </MobileSheet>
  );
};
