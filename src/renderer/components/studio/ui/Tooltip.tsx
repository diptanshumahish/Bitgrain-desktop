import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, delay = 400 }) => {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    timerRef.current = setTimeout(() => {
      if (targetRef.current) {
        const rect = targetRef.current.getBoundingClientRect();
        setCoords({
          x: rect.left + rect.width / 2,
          y: rect.top - 8,
        });
        setVisible(true);
      }
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div
      ref={targetRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="inline-flex items-center justify-center"
    >
      {children}
      {visible && createPortal(
        <div
          className="fixed z-[10000] px-2 py-1 bg-[var(--s-bg-panel)] border border-[var(--s-border)] text-[var(--s-text)] text-[10px] font-medium rounded pointer-events-none -translate-x-1/2 -translate-y-full animate-in fade-in zoom-in-95 duration-100"
          style={{ left: coords.x, top: coords.y }}
        >
          {content}
          {/* Tip */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-[var(--s-border)]" />
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[2px] border-[3px] border-transparent border-t-[var(--s-bg-panel)]" />
        </div>,
        document.body
      )}
    </div>
  );
};
