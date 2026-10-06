import React, { useRef } from "react";
import { createPortal } from "react-dom";
import { useSignalValue } from "../../lib/signal";
import { exportPopupSignal } from "../studio/panels/export-state";
import { ExportPopup } from "../studio/panels/ExportPopup";
import { useClickOutsideClose } from "./portal-utils";

export const ExportPopupPortal: React.FC = () => {
  const data = useSignalValue(exportPopupSignal);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutsideClose(!!data, [ref], () => {
    exportPopupSignal.value = null;
  });

  if (!data) return null;

  const top = data.anchorRect.bottom + 4;
  const right = window.innerWidth - data.anchorRect.right;

  return createPortal(
    <div
      ref={ref}
      style={{ top, right }}
      className="fixed z-[9999] bg-[var(--s-bg-panel)] border border-[var(--s-border)] p-3.5 w-[220px] rounded-2xl"
    >
      <ExportPopup data={data} />
    </div>,
    document.body
  );
};
