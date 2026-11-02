import React, { useContext, useEffect, useRef } from "react";
import { PopoverBackContext } from "./popover-back/popover-back-context";
import { PopoverBackRow } from "./popover-back/PopoverBackRow";

const OPEN_TRIGGER_SELECTOR = '[aria-expanded="true"]';

interface PopoverProps {
  children: React.ReactNode;
  onClose: () => void;
  className?: string;
  static?: boolean;
}

export const Popover: React.FC<PopoverProps> = ({ children, onClose, className = "", static: isStatic = false }) => {
  const ref = useRef<HTMLDivElement>(null);
  const back = useContext(PopoverBackContext);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent): void => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    if (isStatic) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current) return;
      // Don't fire when hidden by a display:none ancestor (e.g. md:hidden parent on mobile)
      if (ref.current.offsetParent === null) return;
      const target = e.target as Element;
      if (target.closest?.(OPEN_TRIGGER_SELECTOR)) return;
      if (!ref.current.contains(target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose, isStatic]);

  if (isStatic) {
    return (
      <div className="w-full">
        {back && <PopoverBackRow back={back} />}
        {children}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      role="dialog"
      className={`absolute bottom-full mb-3 bg-[var(--s-bg-panel)] rounded-xl border border-black/5 dark:border-white/5 overflow-hidden animate-popover font-editorial ${className}`}
    >
      {back && <PopoverBackRow back={back} />}
      {children}
    </div>
  );
};

export const PopoverSection: React.FC<{ title?: React.ReactNode; children: React.ReactNode }> = ({ title, children }) => (
  <div className="p-1.5">
    {title && <p className="text-[12px] font-semibold text-[var(--s-text-subtle)] mb-1 px-2 pt-0.5">{title}</p>}
    {children}
  </div>
);
