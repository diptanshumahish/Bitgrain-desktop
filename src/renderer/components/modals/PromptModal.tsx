import React, { useEffect, useRef, useState } from "react";

interface PromptModalProps {
  title: string;
  label?: string;
  notice?: string;
  defaultValue?: string;
  placeholder?: string;
  confirmLabel?: string;
  onSubmit: (value: string) => void;
  onClose: () => void;
}

export const PromptModal: React.FC<PromptModalProps> = ({
  title,
  label,
  notice,
  defaultValue = "",
  placeholder,
  confirmLabel = "OK",
  onSubmit,
  onClose,
}) => {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[rgba(10,12,18,0.45)] backdrop-blur-[3px] animate-in fade-in duration-150"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="prompt-title"
        className="relative w-full max-w-[380px] rounded-2xl bg-[var(--s-bg-panel)] border border-[var(--s-border)] overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200 font-editorial"
      >
        <div className="px-5 pt-5 pb-4 flex flex-col gap-2.5">
          <h2
            id="prompt-title"
            className="text-[15px] font-semibold   text-[var(--s-text)] leading-snug"
          >
            {title}
          </h2>
          <div className="flex flex-col gap-1.5">
            {label && (
              <span className="text-[11px] font-medium text-[var(--s-text-muted)]">{label}</span>
            )}
            <input
              ref={inputRef}
              value={value}
              placeholder={placeholder}
              onChange={(event) => setValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") submit();
                if (event.key === "Escape") onClose();
              }}
              className="w-full px-3 h-9 rounded-lg bg-[var(--s-bg-input)] text-[12.5px] text-[var(--s-text)] border border-transparent outline-none focus:border-[var(--s-accent)] focus:ring-2 focus:ring-[var(--s-accent-soft)] transition-all"
            />
          </div>
          {notice && (
            <p className="text-[11px] leading-relaxed text-[var(--s-text-muted)]">{notice}</p>
          )}
        </div>

        <div className="px-4 pb-4 flex items-center justify-end gap-1">
          <button
            onClick={onClose}
            className="h-9 px-3.5 rounded-lg text-[12px] font-medium text-[var(--s-text-muted)] bg-transparent hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input)] transition-colors active:scale-[0.98]"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!value.trim()}
            className="h-9 px-4 rounded-lg text-[12px] font-medium bg-[var(--s-text)] text-[var(--s-bg-panel)] hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
