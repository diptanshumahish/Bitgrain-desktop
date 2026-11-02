import React, { useEffect } from "react";
import { X } from "lucide-react";

interface StudioDialogShellProps {
  title: string;
  description?: string;
  widthClass?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const StudioDialogShell: React.FC<StudioDialogShellProps> = ({
  title, description, widthClass = "max-w-xl", onClose, children, footer,
}) => {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent): void => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      onClose();
    };
    window.addEventListener("keydown", closeOnEscape, true);
    return () => window.removeEventListener("keydown", closeOnEscape, true);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-editorial"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`w-full ${widthClass} max-h-[85vh] flex flex-col overflow-hidden rounded-xl border border-[var(--s-border)] bg-[var(--s-bg-panel)] text-[var(--s-text)]`}
      >
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-[var(--s-border)] shrink-0">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-[14px] font-semibold">{title}</h2>
            {description && <p className="text-[12px] text-[var(--s-text-muted)]">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            title="Close"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input)] hover:text-[var(--s-text)]"
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="px-5 py-3 border-t border-[var(--s-border)] shrink-0">{footer}</div>}
      </div>
    </div>
  );
};
