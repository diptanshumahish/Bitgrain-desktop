import React, { useEffect } from "react";
import { Button } from "../components/Button";
import { MODAL_LAYER } from "../overlays/layers/layer-order";

interface ConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  onClose: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  safeDefault?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  message,
  onConfirm,
  onCancel,
  onClose,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  safeDefault = false,
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleCancel();
      if (event.key === "Enter") {
        event.preventDefault();
        if (safeDefault) handleCancel();
        else handleConfirm();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`fixed inset-0 ${MODAL_LAYER} flex items-center justify-center p-4 bg-[rgba(10,12,18,0.45)] backdrop-blur-[3px] animate-in fade-in duration-150`}
      onClick={(event) => event.target === event.currentTarget && handleCancel()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="relative w-full max-w-[380px] rounded-2xl bg-[var(--s-bg-panel)] border border-[var(--s-border)] overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200 font-editorial"
      >
        <div className="px-5 pt-5 pb-4 flex flex-col gap-1.5">
          <h2
            id="confirm-title"
            className="text-[15px] font-semibold text-[var(--s-text)] leading-snug"
          >
            {title}
          </h2>
          <p className="text-[12.5px] text-[var(--s-text-muted)] text-pretty">
            {message}
          </p>
        </div>

        <div className="px-4 pb-4 flex items-center justify-end gap-1">
          <Button variant="ghost" onClick={handleCancel} autoFocus={safeDefault}>
            {cancelLabel}
          </Button>
          <Button
            variant={danger ? "destructive" : "primary"}
            onClick={handleConfirm}
            autoFocus={!safeDefault}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
