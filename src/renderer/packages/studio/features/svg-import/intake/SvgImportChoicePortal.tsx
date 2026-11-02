import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { useSignalValue } from "@bitgrain/core/signal";
import { Button } from "@bitgrain/ui/components/Button";
import { onSvgImportChoice } from "./svg-import-events";
import { chooseEditable, chooseImage, dismissSvgChoice, enqueueSvgChoice, svgChoiceQueueSignal } from "./svg-choice-store";
import { MODAL_LAYER } from "@bitgrain/ui/overlays/layers/layer-order";

const useChoiceKeys = (active: boolean): void => {
  useEffect(() => {
    if (!active) return;
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") dismissSvgChoice();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);
};

export const SvgImportChoicePortal: React.FC = () => {
  const queue = useSignalValue(svgChoiceQueueSignal);
  const current = queue[0];

  useEffect(() => onSvgImportChoice(enqueueSvgChoice), []);
  useChoiceKeys(Boolean(current));

  if (!current) return null;

  return createPortal(
    <div
      className={`fixed inset-0 ${MODAL_LAYER} flex items-center justify-center p-4 bg-[rgba(10,12,18,0.45)] backdrop-blur-[3px] animate-in fade-in duration-150`}
      onClick={(event) => event.target === event.currentTarget && dismissSvgChoice()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="svg-import-title"
        data-popover-root
        className="w-full max-w-[400px] rounded-2xl bg-[var(--s-bg-panel)] border border-[var(--s-border)] overflow-hidden animate-in fade-in zoom-in-95 duration-200 font-editorial"
      >
        <div className="px-5 pt-5 pb-4 flex flex-col gap-1.5">
          <h2 id="svg-import-title" className="text-[15px] font-semibold text-[var(--s-text)] leading-snug truncate">
            Bring in {current.name}
          </h2>
          <p className="text-[12.5px] text-[var(--s-text-muted)] text-pretty">
            Editable layers let you change every shape, color and piece of text. An image keeps it exactly as it looks.
          </p>
        </div>
        <div className="px-4 pb-4 flex items-center justify-end gap-1">
          <Button variant="ghost" onClick={chooseImage}>
            Import as image
          </Button>
          <Button variant="primary" onClick={chooseEditable} autoFocus>
            Import as editable layers
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
