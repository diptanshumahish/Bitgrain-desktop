import React, { useRef } from "react";
import { X } from "lucide-react";
import { useSheetSwipeClose } from "./use-sheet-swipe-close";
import { useSheetTopTracking } from "./use-sheet-top-tracking";

type MobileSheetPlacement = "above-bar" | "above-keyboard" | "full";

interface MobileSheetProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  headerAction?: React.ReactNode;
  dimmed?: boolean;
  hideClose?: boolean;
  placement?: MobileSheetPlacement;
}

const CLOSE_ICON_SIZE = 18;

const PLACEMENT_CLASS: Record<MobileSheetPlacement, string> = {
  "above-bar": "z-50 bottom-[var(--mobile-bar-height,0px)]",
  "above-keyboard": "z-50 bottom-[max(var(--mobile-keyboard-inset,0px),var(--mobile-bar-height,0px))]",
  full: "z-[70] bottom-0 pb-safe",
};

const BACKDROP_LAYER_CLASS: Record<MobileSheetPlacement, string> = {
  "above-bar": "z-40",
  "above-keyboard": "z-40",
  full: "z-[65]",
};

export const MobileSheet: React.FC<MobileSheetProps> = ({
  title, onClose, children, footer, headerAction, dimmed = true, hideClose = false, placement = "above-bar",
}) => {
  const swipe = useSheetSwipeClose(onClose);
  const sheetRef = useRef<HTMLElement>(null);
  useSheetTopTracking(sheetRef);

  return (
    <>
      <div
        className={`fixed inset-0 animate-in fade-in duration-150 ${BACKDROP_LAYER_CLASS[placement]} ${dimmed ? "bg-black/30" : "bg-transparent"}`}
        onClick={onClose}
      />
      <section
        ref={sheetRef}
        role="dialog"
        aria-label={title}
        className={`fixed inset-x-0 flex flex-col max-h-[70dvh] bg-[var(--s-bg-panel)] rounded-t-2xl border-t border-[var(--s-border)] font-editorial animate-in slide-in-from-bottom duration-200 ${PLACEMENT_CLASS[placement]}`}
      >
        <header className="shrink-0 touch-none" onPointerDown={swipe.onPointerDown} onPointerUp={swipe.onPointerUp}>
          <div className="mx-auto mt-2 h-1 w-9 rounded-full bg-[var(--s-text-subtle)] opacity-40" />
          <div className="flex items-center gap-2 pl-5 pr-2 h-12">
            <h2 className="m-0 flex-1 min-w-0 truncate text-[15px] font-semibold text-[var(--s-text)]">{title}</h2>
            {headerAction}
            {!hideClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="w-11 h-11 flex items-center justify-center rounded-xl text-[var(--s-text-muted)] active:bg-[var(--s-bg-input-hover)]"
              >
                <X size={CLOSE_ICON_SIZE} strokeWidth={2} />
              </button>
            )}
          </div>
        </header>
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar overscroll-contain">{children}</div>
        {footer && <div className="shrink-0 border-t border-[var(--s-border)] px-4 py-3">{footer}</div>}
      </section>
    </>
  );
};
