import React, { useId, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { signal, useSignalValue } from "../../../../lib/signal";
const openMenuIdSignal = signal<string | null>(null);

export interface SelectOption {
  value: string;
  label: string;
  group?: string;
  glyph?: string;
}

interface SelectMenuProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
}

const MENU_MARGIN = 8;
const MENU_GAP = 4;

export const SelectMenu: React.FC<SelectMenuProps> = ({
  value,
  options,
  onChange,
  placeholder,
  ariaLabel,
  className,
}) => {
  const id = useId();
  const openId = useSignalValue(openMenuIdSignal);
  const open = openId === id;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const coordsRef = useRef<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 0,
  });

  const selected = options.find((o) => o.value === value);

  const close = (): void => {
    openMenuIdSignal.value = null;
  };

  const toggle = (): void => {
    openMenuIdSignal.value = open ? null : id;
  };

  useEffect(() => {
    if (!open) return;
    const handler = (event: MouseEvent): void => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      close();
    };
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("mousedown", handler, true);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", handler, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current || !menuRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const menuRect = menuRef.current.getBoundingClientRect();
    const width = Math.max(triggerRect.width, 180);
    let top = triggerRect.bottom + MENU_GAP;
    let left = triggerRect.left;
    if (top + menuRect.height > window.innerHeight - MENU_MARGIN) {
      top = triggerRect.top - menuRect.height - MENU_GAP;
    }
    if (left + width > window.innerWidth - MENU_MARGIN) {
      left = window.innerWidth - width - MENU_MARGIN;
    }
    coordsRef.current = { top: Math.max(MENU_MARGIN, top), left: Math.max(MENU_MARGIN, left), width };
    menuRef.current.style.top = `${coordsRef.current.top}px`;
    menuRef.current.style.left = `${coordsRef.current.left}px`;
    menuRef.current.style.minWidth = `${coordsRef.current.width}px`;
  }, [open, options.length]);

  const grouped = options.reduce<Record<string, SelectOption[]>>((acc, option) => {
    const key = option.group ?? "";
    acc[key] = acc[key] ?? [];
    acc[key].push(option);
    return acc;
  }, {});

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className={`flex items-center gap-2 bg-[var(--s-bg-input)] hover:bg-[var(--s-bg-input-hover)] border border-[var(--s-border)] rounded-md px-2.5 py-1.5 text-[12px] text-[var(--s-text)] transition-colors ${className ?? ""}`}
      >
        <span className="flex-1 text-left truncate flex items-center gap-2">
          {selected?.glyph && (
            <span
              aria-hidden
              className="font-mono font-bold text-[12px] leading-none text-[var(--s-text-subtle)]"
            >
              {selected.glyph}
            </span>
          )}
          <span className="truncate">
            {selected?.label ?? placeholder ?? "Select..."}
          </span>
        </span>
        <span
          aria-hidden
          className={`font-mono font-bold text-[10px] leading-none text-[var(--s-text-subtle)] transition-transform ${open ? "rotate-180" : ""}`}
        >
          v
        </span>
      </button>
      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="listbox"
            className="fixed z-[100] max-h-[320px] overflow-y-auto bg-[var(--s-bg-panel)] border border-[var(--s-border)] rounded-lg py-1 backdrop-blur-md"
          >
            {Object.entries(grouped).map(([group, groupOptions]) => (
              <div key={group || "default"}>
                {group && (
                  <div className="px-3 pt-2 pb-1 text-[9px] text-[var(--s-text-subtle)] font-semibold">
                    {group}
                  </div>
                )}
                {groupOptions.map((option) => {
                  const isSelected = option.value === value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        onChange(option.value);
                        close();
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-left transition-colors ${
                        isSelected
                          ? "bg-[var(--s-accent-soft)] text-[var(--s-accent)]"
                          : "text-[var(--s-text)] hover:bg-[var(--s-bg-input)]"
                      }`}
                    >
                      {option.glyph && (
                        <span
                          aria-hidden
                          className="font-mono font-bold text-[12px] leading-none w-7 text-[var(--s-text-subtle)]"
                        >
                          {option.glyph}
                        </span>
                      )}
                      <span className="flex-1 truncate">{option.label}</span>
                      {isSelected && (
                        <span
                          aria-hidden
                          className="font-mono font-bold text-[12px] leading-none"
                        >
                          [x]
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
};
