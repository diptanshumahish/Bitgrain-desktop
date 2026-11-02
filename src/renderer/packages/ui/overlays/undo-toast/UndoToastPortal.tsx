import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { useSignalValue } from "@bitgrain/core/signal";
import { onUndoToast } from "./undo-toast-events";
import { showUndoToast, undoCurrentToast, undoToastSignal } from "./undo-toast-store";
import { TOAST_LAYER } from "../layers/layer-order";
import { UNDO_TOAST_ANCHOR_CLASS } from "../layers/toast-anchor-class";
import "../layers/toast-motion.css";

const DEFAULT_ACTION_LABEL = "Undo";

export const UndoToastPortal: React.FC = () => {
  const toast = useSignalValue(undoToastSignal);

  useEffect(() => onUndoToast(showUndoToast), []);

  if (!toast) return null;

  return createPortal(
    <div role="status" aria-live="polite" className={`fixed ${UNDO_TOAST_ANCHOR_CLASS[toast.anchor]} left-1/2 ${TOAST_LAYER} w-max max-w-[calc(100vw-32px)] font-editorial mosh-toast-in`}>
      <div className="flex items-center gap-4 rounded-2xl border border-[var(--s-border)] bg-[var(--s-bg-panel)]/95 backdrop-blur-xl pl-4 pr-2 py-2">
        <div className="flex flex-col gap-0.5">
          <p className="text-[13px] font-semibold leading-tight text-[var(--s-text)] sm:whitespace-nowrap">{toast.title}</p>
          <p className="text-[11px] leading-tight text-[var(--s-text-subtle)] sm:whitespace-nowrap">{toast.detail}</p>
        </div>
        <button
          type="button"
          onClick={undoCurrentToast}
          className="px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-[var(--s-accent)] text-[var(--s-accent-text)] hover:opacity-90"
        >
          {toast.actionLabel ?? DEFAULT_ACTION_LABEL}
        </button>
      </div>
    </div>,
    document.body,
  );
};
