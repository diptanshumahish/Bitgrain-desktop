import React, { useEffect } from "react";

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

  const confirmClasses = danger
    ? "bg-red-600 text-white hover:bg-red-500"
    : "bg-[var(--s-text)] text-[var(--s-bg-panel)] hover:opacity-95";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[rgba(10,12,18,0.45)] backdrop-blur-[3px] animate-in fade-in duration-150"
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
            className="text-[15px] font-semibold   text-[var(--s-text)] leading-snug"
          >
            {title}
          </h2>
          <p className="text-[12.5px] leading-relaxed text-[var(--s-text-muted)] text-pretty">
            {message}
          </p>
        </div>

        <div className="px-4 pb-4 flex items-center justify-end gap-1">
          <button
            onClick={handleCancel}
            autoFocus={safeDefault}
            className="h-9 px-3.5 rounded-lg text-[12px] font-medium text-[var(--s-text-muted)] bg-transparent hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input)] transition-colors active:scale-[0.98]"
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            autoFocus={!safeDefault}
            className={`h-9 px-4 rounded-lg text-[12px] font-medium transition-all active:scale-[0.98] ${confirmClasses}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
