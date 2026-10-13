import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { Dice5 } from "lucide-react";
import { useSignalValue } from "../../../lib/signal";
import { onMoshResult } from "../../../pages/home-page/mosh/feedback/mosh-result-events";
import { moshToastSignal, showMoshToast } from "./mosh-toast-store";

export const MoshToastPortal: React.FC = () => {
  const toast = useSignalValue(moshToastSignal);

  useEffect(() => onMoshResult(showMoshToast), []);

  if (!toast) return null;

  return createPortal(
    <div
      key={toast.id}
      role="status"
      aria-live="polite"
      className={`fixed bottom-32 left-1/2 z-[10000] pointer-events-none font-editorial ${toast.leaving ? "mosh-toast-out" : "mosh-toast-in"}`}
    >
      <div className="flex items-center gap-3 rounded-2xl border border-[var(--s-border)] bg-[var(--s-bg-panel)]/95 backdrop-blur-xl pl-2.5 pr-4 py-2.5">
        <span className="mosh-toast-badge flex items-center justify-center w-8 h-8 rounded-xl bg-[var(--s-accent)] text-[var(--s-accent-text)]">
          <Dice5 size={16} strokeWidth={2} />
        </span>
        <div className="flex flex-col gap-0.5 min-w-0">
          <p className="text-[13px] font-semibold leading-tight text-[var(--s-text)] whitespace-nowrap">
            {toast.title}
            <span className="font-normal text-[var(--s-text-muted)]">, {toast.detail}</span>
          </p>
          <p className="text-[11px] leading-tight text-[var(--s-text-subtle)] whitespace-nowrap">{toast.reason}</p>
        </div>
      </div>
    </div>,
    document.body,
  );
};
