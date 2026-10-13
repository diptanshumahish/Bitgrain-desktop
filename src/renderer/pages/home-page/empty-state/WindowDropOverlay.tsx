import React from "react";

interface WindowDropOverlayProps {
  overlayRef: React.RefObject<HTMLDivElement | null>;
}

export const WindowDropOverlay: React.FC<WindowDropOverlayProps> = ({ overlayRef }) => (
  <div
    ref={overlayRef}
    data-active="false"
    aria-hidden="true"
    className="fixed inset-0 z-[70] p-4 pointer-events-none opacity-0 transition-opacity duration-150 data-[active=true]:opacity-100"
  >
    <div className="w-full h-full flex items-center justify-center rounded-2xl border-2 border-dashed border-violet-500 bg-[var(--s-bg-canvas)]/85 backdrop-blur-sm">
      <span className="text-[clamp(1.5rem,3vw,2.25rem)] font-medium text-[var(--s-text)]">
        let go to open it
      </span>
    </div>
  </div>
);
