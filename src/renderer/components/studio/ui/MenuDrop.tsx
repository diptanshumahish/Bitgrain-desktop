import React from "react";
import { useSignalValue } from "../../../lib/signal";
import { activeMenuSignal } from "./menu-signal";

interface MenuDropProps {
  name: string;
  label: string;
  children: React.ReactNode;
}

export const MenuDrop: React.FC<MenuDropProps> = ({ name, label, children }) => {
  const open = useSignalValue(activeMenuSignal);

  return (
    <div className="relative h-full flex items-center">
      <button
        onClick={() => {
          activeMenuSignal.value = open === name ? null : name;
        }}
        onMouseEnter={() => {
          if (open !== null) activeMenuSignal.value = name;
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
        <div className="absolute top-[calc(100%+4px)] left-0 z-[200] bg-[var(--s-bg-panel)] border border-[var(--s-border)] py-1.5 px-1 min-w-[190px] font-editorial rounded-xl">
          {children}
        </div>
      )}
    </div>
  );
};
