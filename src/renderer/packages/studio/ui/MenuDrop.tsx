import React, { useEffect, useRef } from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import { activeMenuSignal } from "./menu-signal";

interface MenuDropProps {
  name: string;
  label: string;
  children: React.ReactNode;
}

export const MenuDrop: React.FC<MenuDropProps> = ({ name, label, children }) => {
  const open = useSignalValue(activeMenuSignal);
  const openedByHoverRef = useRef(false);
  const isOpen = open === name;

  useEffect(() => {
    if (!isOpen) return undefined;
    const closeOnEscape = (event: KeyboardEvent): void => {
      if (event.key === "Escape") activeMenuSignal.value = null;
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  return (
    <div className="relative h-full flex items-center">
      <button
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => {
          if (openedByHoverRef.current) {
            openedByHoverRef.current = false;
            return;
          }
          activeMenuSignal.value = isOpen ? null : name;
        }}
        onMouseEnter={() => {
          if (open === null || isOpen) return;
          openedByHoverRef.current = true;
          activeMenuSignal.value = name;
        }}
        onMouseLeave={() => {
          openedByHoverRef.current = false;
        }}
        className={`px-2.5 h-[22px] my-[2px] rounded-md text-[12px] font-medium border-none cursor-pointer transition-colors font-inherit ${
          open === name
            ? "bg-[var(--s-accent)] text-[var(--s-accent-text)]"
            : "bg-transparent text-[var(--s-text)] hover:bg-[var(--s-bg-input)]"
        }`}
      >
        {label}
      </button>
      {open === name && (
        <div role="menu" className="absolute top-[calc(100%+4px)] left-0 z-[200] bg-[var(--s-bg-panel)] border border-[var(--s-border)] py-1.5 px-1 min-w-[190px] font-editorial rounded-xl">
          {children}
        </div>
      )}
    </div>
  );
};
