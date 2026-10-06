import React, { useEffect, useRef } from "react";

interface PopoverProps {
  children: React.ReactNode;
  onClose: () => void;
  className?: string;
  static?: boolean; // when true: renders inline (no absolute positioning, no click-outside)
}

export const Popover: React.FC<PopoverProps> = ({ children, onClose, className = "", static: isStatic = false }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isStatic) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current) return;
      // Don't fire when hidden by a display:none ancestor (e.g. md:hidden parent on mobile)
      if (ref.current.offsetParent === null) return;
      if (!ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose, isStatic]);

  if (isStatic) {
    return <div className="w-full">{children}</div>;
  }

  return (
    <div
      ref={ref}
      className={`absolute bottom-full mb-3 bg-[var(--s-bg-panel)] rounded-xl border border-black/5 dark:border-white/5 overflow-hidden animate-popover font-editorial ${className}`}
    >
      {children}
    </div>
  );
};

export const PopoverSection: React.FC<{ title?: React.ReactNode; children: React.ReactNode }> = ({ title, children }) => (
  <div className="p-1.5">
    {title && <p className="text-[10px] font-semibold text-[var(--s-text-subtle)] mb-1 px-2 pt-0.5">{title}</p>}
    {children}
  </div>
);
