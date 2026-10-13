import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { useSignalValue } from "../../../lib/signal";
import { onStatusToast } from "./status-toast-events";
import { statusToastSignal, showStatusToast } from "./status-toast-store";

export const StatusToastPortal: React.FC = () => {
  const toast = useSignalValue(statusToastSignal);

  useEffect(() => onStatusToast(showStatusToast), []);

  if (!toast) return null;

  return createPortal(
    <div
      key={toast.id}
      role="status"
      aria-live="polite"
      className={`fixed bottom-32 left-1/2 z-[10000] pointer-events-none font-editorial ${toast.leaving ? "mosh-toast-out" : "mosh-toast-in"}`}
    >
      <div className="flex flex-col gap-0.5 w-max max-w-[calc(100vw-32px)] md:max-w-[440px] rounded-2xl border border-[var(--s-border)] bg-[var(--s-bg-panel)]/95 backdrop-blur-xl px-4 py-2.5">
        <p className="text-[13px] font-semibold leading-tight text-[var(--s-text)]">{toast.title}</p>
        <p className="text-[12px] leading-snug text-[var(--s-text-muted)]">{toast.detail}</p>
      </div>
    </div>,
    document.body,
  );
};
