import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  options: {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    danger?: boolean;
  }[];
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose, options }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return createPortal(
    <div
      ref={menuRef}
      className="fixed z-[9999] w-48 bg-zinc-900 border border-white/10 rounded-lg overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-100"
      style={{ left: x, top: y }}
    >
      {options.map((opt, i) => (
        <button
          key={i}
          onClick={() => {
            opt.onClick();
            onClose();
          }}
          className={`w-full flex items-center gap-3 px-3 py-2 text-[11px] font-medium transition-colors ${
            opt.danger
              ? "text-red-400 hover:bg-red-500/10"
              : "text-zinc-300 hover:bg-white/5 hover:text-white"
          }`}
        >
          <span className="shrink-0">{opt.icon}</span>
          <span>{opt.label}</span>
        </button>
      ))}
    </div>,
    document.body,
  );
};
