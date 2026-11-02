import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { useSignalValue } from "@bitgrain/core/signal";
import { onStatusToast } from "./status-toast-events";
import { statusToastSignal, showStatusToast } from "./status-toast-store";
import { TOAST_LAYER } from "../layers/layer-order";
import { TOAST_ANCHOR_CLASS } from "../layers/toast-anchor-class";
import "../layers/toast-motion.css";

export const StatusToastPortal: React.FC = () => {
  const toast = useSignalValue(statusToastSignal);

  useEffect(() => onStatusToast(showStatusToast), []);

  if (!toast) return null;

  return createPortal(
    <div
      key={toast.id}
      role="status"
      aria-live="polite"
      className={`fixed ${TOAST_ANCHOR_CLASS[toast.anchor]} left-1/2 ${TOAST_LAYER} pointer-events-none font-editorial ${toast.leaving ? "mosh-toast-out" : "mosh-toast-in"}`}
    >
      <div className="flex flex-col gap-0.5 w-max max-w-[calc(100vw-32px)] md:max-w-[440px] rounded-2xl border border-[var(--s-border)] bg-[var(--s-bg-panel)] px-4 py-2.5">
        <p className="text-[13px] font-semibold leading-tight text-[var(--s-text)]">{toast.title}</p>
        <p className="text-[12px] leading-snug text-[var(--s-text-muted)]">{toast.detail}</p>
        {toast.action && (
          <Link
            to={toast.action.href}
            className="pointer-events-auto w-max text-[12px] font-semibold text-[var(--s-text)] underline underline-offset-2 hover:no-underline"
          >
            {toast.action.label}
          </Link>
        )}
      </div>
    </div>,
    document.body,
  );
};
