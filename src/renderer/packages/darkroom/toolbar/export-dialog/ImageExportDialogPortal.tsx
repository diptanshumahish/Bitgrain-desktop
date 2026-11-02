import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { useSignalValue } from "@bitgrain/core/signal";
import { EditorExportPanel } from "../editor-export/EditorExportPanel";
import { ExportArtPanel } from "./ExportArtPanel";
import { ExportDialogHeader } from "./ExportDialogHeader";
import { onExportDialog } from "./export-dialog-events";
import { closeExportDialog, exportDialogSignal, openExportDialog } from "./export-dialog-store";
import type { ToolbarCallbacks } from "../toolbar-types";
import { MODAL_LAYER } from "@bitgrain/ui/overlays/layers/layer-order";

const ESCAPE_KEY = "Escape";
const POPOVER_ROOT_SELECTOR = "[data-popover-root]";

const closeOnEscape = (event: KeyboardEvent): void => {
  if (event.key !== ESCAPE_KEY || document.querySelector(POPOVER_ROOT_SELECTOR)) return;
  event.stopPropagation();
  closeExportDialog();
};

interface ImageExportDialogPortalProps {
  callbacks: ToolbarCallbacks;
}

export const ImageExportDialogPortal: React.FC<ImageExportDialogPortalProps> = ({ callbacks }) => {
  const dialog = useSignalValue(exportDialogSignal);
  const isOpen = dialog !== null;

  useEffect(() => onExportDialog(openExportDialog), []);

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener("keydown", closeOnEscape, true);
    return () => window.removeEventListener("keydown", closeOnEscape, true);
  }, [isOpen]);

  if (!dialog) return null;

  return createPortal(
    <div
      className={`fixed inset-0 ${MODAL_LAYER} flex items-center justify-center p-4 bg-[rgba(10,12,18,0.5)] backdrop-blur-[3px] animate-in fade-in duration-150`}
      onClick={(event) => event.target === event.currentTarget && closeExportDialog()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="image-export-title"
        className="w-full max-w-[760px] h-[600px] max-h-[92dvh] flex overflow-hidden rounded-2xl bg-[var(--s-bg-panel)] border border-[var(--s-border)] font-editorial animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200"
      >
        <ExportArtPanel snapshot={dialog.snapshot} fileName={dialog.fileName} />
        <div className="flex-1 min-w-0 min-h-0 flex flex-col">
          <ExportDialogHeader onClose={closeExportDialog} />
          <EditorExportPanel callbacks={callbacks} onClose={closeExportDialog} />
        </div>
      </div>
    </div>,
    document.body,
  );
};
