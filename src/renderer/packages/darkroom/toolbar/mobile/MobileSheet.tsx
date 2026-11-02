import React, { useRef } from "react";
import { ChevronLeft, X } from "lucide-react";
import { useSwipeToClose } from "./use-swipe-to-close";

export interface SheetBack {
  label: string;
  onBack: () => void;
}

interface MobileSheetProps {
  title: string;
  back: SheetBack | null;
  onClose: () => void;
  children: React.ReactNode;
}

const ICON_SIZE = 16;

export const MobileSheet: React.FC<MobileSheetProps> = ({ title, back, onClose, children }) => {
  const sheetRef = useRef<HTMLElement>(null);
  const swipeHandlers = useSwipeToClose(sheetRef, onClose);

  return (
    <section
      ref={sheetRef}
      aria-label={title}
      className="flex flex-col max-h-[44dvh] bg-[var(--s-bg-panel)] border-t border-[var(--s-border)] rounded-t-2xl animate-popover"
    >
      <div {...swipeHandlers} className="shrink-0 touch-none cursor-grab">
        <div aria-hidden="true" className="flex justify-center pt-2">
          <span className="w-9 h-1 rounded-full bg-[var(--s-text-subtle)] opacity-40" />
        </div>
        <div className="flex items-center justify-between pl-3 pr-1.5 h-11">
          {back ? (
            <button type="button" onClick={back.onBack} className="flex items-center gap-1 min-h-11 pr-2 text-[14px] font-medium text-[var(--s-text-muted)]">
              <ChevronLeft size={ICON_SIZE} strokeWidth={2} /> {back.label}
            </button>
          ) : (
            <span className="pl-2 text-[14px] font-medium text-[var(--s-text)] first-letter:uppercase">{title}</span>
          )}
          <button type="button" aria-label="Close panel" onClick={onClose} className="w-11 h-11 flex items-center justify-center rounded-full text-[var(--s-text-muted)] active:bg-[var(--s-bg-input-hover)]">
            <X size={ICON_SIZE} strokeWidth={2} />
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain no-scrollbar border-t border-[var(--s-border)]">
        {children}
      </div>
    </section>
  );
};
