import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { useSignalValue } from "../../../lib/signal";
import { onUndoToast } from "./undo-toast-events";
import { showUndoToast, undoCurrentToast, undoToastSignal } from "./undo-toast-store";

export const UndoToastPortal: React.FC = () => {
  const toast = useSignalValue(undoToastSignal);

  useEffect(() => onUndoToast(showUndoToast), []);

  if (!toast) return null;

  return createPortal(
    <div role="status" aria-live="polite" className="fixed bottom-36 md:bottom-32 left-1/2 -translate-x-1/2 z-[10000] font-editorial mosh-toast-in">
      <div className="flex items-center gap-4 rounded-2xl border border-[var(--s-border)] bg-[var(--s-bg-panel)]/95 backdrop-blur-xl pl-4 pr-2 py-2">
        <div className="flex flex-col gap-0.5">
          <p className="text-[13px] font-semibold leading-tight text-[var(--s-text)] whitespace-nowrap">{toast.title}</p>
          <p className="text-[11px] leading-tight text-[var(--s-text-subtle)] whitespace-nowrap">{toast.detail}</p>
        </div>
        <button
          type="button"
          onClick={undoCurrentToast}
          className="px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-[var(--s-accent)] text-[var(--s-accent-text)] hover:opacity-90"
        >
          Undo
        </button>
      </div>
    </div>,
    document.body,
  );
};
