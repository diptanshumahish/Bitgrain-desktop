import React, { useEffect, useMemo, useState } from "react";
import type { GroupLayer } from "@bitgrain/studio-core/model/studio-types";
import {
  generatePattern,
  generatePatternGroup,
  type PatternKind,
  type PatternParams,
} from "@bitgrain/studio-core/pattern/pattern-engine";
import { defaultParamsFor } from "./PatternPresets";
import { PatternPreview } from "./PatternPreview";
import { PatternControls } from "./PatternControls";
import { PatternPresetGrid } from "./PatternPresetGrid";
import { Button } from "@bitgrain/ui/components/Button";
import { MODAL_LAYER } from "@bitgrain/ui/overlays/layers/layer-order";

interface PatternModalProps {
  canvasWidth: number;
  canvasHeight: number;
  onApply: (group: GroupLayer) => void;
  onClose: () => void;
}

const PREVIEW_SIZE = 320;

export const PatternModal: React.FC<PatternModalProps> = ({
  canvasWidth,
  canvasHeight,
  onApply,
  onClose,
}) => {
  const [kind, setKind] = useState<PatternKind>("checkerboard");
  const [params, setParams] = useState<PatternParams>(() => defaultParamsFor("checkerboard"));

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const previewLayers = useMemo(() => generatePattern(params), [params]);

  const handleSelectPreset = (next: PatternKind): void => {
    setKind(next);
    setParams(defaultParamsFor(next));
  };

  const handleApply = (): void => {
    const group = generatePatternGroup(params, canvasWidth, canvasHeight);
    if (!group) return;
    onApply(group);
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 ${MODAL_LAYER} flex items-center justify-center p-4 bg-[rgba(10,12,18,0.45)] backdrop-blur-[3px] animate-in fade-in duration-150`}
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pattern-title"
        className="relative w-full max-w-[880px] rounded-2xl bg-[var(--s-bg-panel)] border border-[var(--s-border)] overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200 font-editorial"
      >
        <div className="px-5 pt-4 pb-3 flex items-baseline justify-between border-b border-[var(--s-border)]">
          <div className="flex flex-col gap-0.5">
            <h2 id="pattern-title" className="text-[15px] font-semibold text-[var(--s-text)] leading-snug">
              Patterns
            </h2>
            <p className="text-[11px] text-[var(--s-text-muted)]">
              Pick a shape, dial in the details, drop it on the canvas.
            </p>
          </div>
          <a
            href="/docs/05-studio-advanced/02-patterns-and-auto-layout"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-[11px] text-[var(--s-text-muted)] hover:text-[var(--s-text)] underline underline-offset-2 transition-colors"
          >
            Guide
          </a>
        </div>

        <div className="grid grid-cols-[220px_1fr] gap-4 p-5">
          <div className="min-w-0">
            <PatternPresetGrid active={kind} onSelect={handleSelectPreset} />
          </div>

          <div className="flex gap-5 min-w-0">
            <div className="shrink-0 flex flex-col gap-2">
              <PatternPreview layers={previewLayers} size={PREVIEW_SIZE} />
              <span className="text-[10.5px] text-[var(--s-text-subtle)] px-0.5">
                Live preview, scales to fit the canvas on insert.
              </span>
            </div>
            <div className="flex-1 min-w-0 max-h-[340px] overflow-y-auto pr-1">
              <PatternControls params={params} onChange={setParams} />
            </div>
          </div>
        </div>

        <div className="px-4 pb-4 pt-3 flex items-center justify-end gap-1 border-t border-[var(--s-border)]">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleApply} autoFocus>
            Insert pattern
          </Button>
        </div>
      </div>
    </div>
  );
};
