import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useSignalValue } from "../../lib/signal";
import { exportPopupSignal } from "../studio/panels/export-state";
import { ExportPopup } from "../studio/panels/ExportPopup";

const CLOSE_ICON_SIZE = 15;

const closeExportPopup = (): void => {
  exportPopupSignal.value = null;
};

export const ExportPopupPortal: React.FC = () => {
  const data = useSignalValue(exportPopupSignal);
  const isOpen = data !== null;

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") closeExportPopup();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  if (!data) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[rgba(10,12,18,0.45)] backdrop-blur-[3px] animate-in fade-in duration-150"
      onClick={(event) => event.target === event.currentTarget && closeExportPopup()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-dialog-title"
        className="relative w-full max-w-[820px] max-h-[92dvh] overflow-y-auto rounded-2xl bg-[var(--s-bg-panel)] border border-[var(--s-border)] p-5 animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200 font-editorial"
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex flex-col gap-0.5">
            <h2 id="export-dialog-title" className="m-0 text-[15px] font-semibold text-[var(--s-text)]">
              Export
            </h2>
            <p className="m-0 text-[12px] text-[var(--s-text-muted)]">
              Pick a size and format, or switch on print ready for a PDF your printer will love.
            </p>
          </div>
          <button
            onClick={closeExportPopup}
            aria-label="Close export"
            className="flex items-center justify-center w-8 h-8 shrink-0 rounded-lg bg-transparent border-none cursor-pointer text-[var(--s-text-muted)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input)] transition-colors"
          >
            <X size={CLOSE_ICON_SIZE} strokeWidth={1.75} />
          </button>
        </div>
        <ExportPopup data={data} />
      </div>
    </div>,
    document.body,
  );
};
