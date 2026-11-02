import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { closeTonePanel, onTonePanel } from "./tone-panel-events";
import { EditorToneContent } from "./EditorToneContent";
import { selectedMaskIdSignal } from "./editor-mask-store";
import { trackEvent } from "../../../lib/tracker";

export const EditorTonePanel: React.FC = () => {
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);

  useEffect(
    () => onTonePanel((command) => {
      const next = command === "toggle" ? !openRef.current : false;
      if (next && !openRef.current) trackEvent("grading", "panel_opened", { details: { surface: "editor" } });
      openRef.current = next;
      setOpen(next);
    }),
    [],
  );

  useEffect(() => {
    if (!open) selectedMaskIdSignal.value = null;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === "Escape") closeTonePanel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return createPortal(
    <aside className="fixed z-[60] flex flex-col font-editorial bg-[var(--s-bg-panel)]/95 backdrop-blur-xl border border-[var(--s-border)] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.18)] inset-x-3 bottom-3 h-[62vh] md:inset-x-auto md:right-5 md:top-20 md:bottom-28 md:h-auto md:w-[300px]">
      <div className="flex items-center justify-between px-4 h-12 border-b border-[var(--s-border)] shrink-0">
        <span className="text-[13px] font-semibold text-[var(--s-text)]">tone</span>
        <button
          type="button"
          onClick={closeTonePanel}
          aria-label="close tone panel"
          className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input)] cursor-pointer"
        >
          <X size={14} />
        </button>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 py-3">
        <EditorToneContent />
      </div>
    </aside>,
    document.body,
  );
};
