import React, { useEffect, useMemo, useState } from "react";
import type { GroupLayer } from "../../../data/studioTypes";
import {
  generatePattern,
  generatePatternGroup,
  type PatternKind,
  type PatternParams,
} from "../../../utils/pattern-engine";
import { PATTERN_PRESETS, defaultParamsFor } from "./PatternPresets";
import { PatternPreview } from "./PatternPreview";
import { PatternControls } from "./PatternControls";

interface PatternModalProps {
  canvasWidth: number;
  canvasHeight: number;
  onApply: (group: GroupLayer) => void;
  onClose: () => void;
}

const PREVIEW_SIZE = 280;

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

  const handleSelectPreset = (next: PatternKind) => {
    setKind(next);
    setParams(defaultParamsFor(next));
  };

  const handleApply = () => {
    const group = generatePatternGroup(params, canvasWidth, canvasHeight);
    if (!group) return;
    onApply(group);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[rgba(10,12,18,0.45)] backdrop-blur-[3px] animate-in fade-in duration-150"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pattern-title"
        className="relative w-full max-w-[760px] rounded-2xl bg-[var(--s-bg-panel)] border border-[var(--s-border)] overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200 font-editorial"
      >
        <div className="px-5 pt-5 pb-3 flex items-baseline justify-between border-b border-[var(--s-border)]">
          <div className="flex flex-col gap-0.5">
            <h2 id="pattern-title" className="text-[15px] font-semibold text-[var(--s-text)] leading-snug">
              Patterns
            </h2>
            <p className="text-[11px] text-[var(--s-text-muted)]">
              Generate a pattern in one click, fine-tune it anytime from the Pattern panel
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

        <div className="flex">
          <div className="w-[180px] border-r border-[var(--s-border)] py-3 flex flex-col gap-0.5">
            {PATTERN_PRESETS.map((preset) => (
              <button
                key={preset.kind}
                onClick={() => handleSelectPreset(preset.kind)}
                className={`mx-2 px-3 py-2 rounded-lg text-left transition-colors ${
                  kind === preset.kind
                    ? "bg-[var(--s-bg-input)] text-[var(--s-text)]"
                    : "text-[var(--s-text-muted)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input)]/60"
                }`}
              >
                <div className="text-[12px] font-semibold leading-tight">{preset.label}</div>
                <div className="text-[10px] text-[var(--s-text-muted)] leading-tight mt-0.5">
                  {preset.hint}
                </div>
              </button>
            ))}
          </div>

          <div className="flex-1 p-5 flex gap-5">
            <div className="shrink-0">
              <PatternPreview layers={previewLayers} size={PREVIEW_SIZE} />
            </div>
            <div className="flex-1 min-w-0 max-h-[280px] overflow-y-auto pr-1">
              <PatternControls params={params} onChange={setParams} />
            </div>
          </div>
        </div>

        <div className="px-4 pb-4 pt-3 flex items-center justify-end gap-1 border-t border-[var(--s-border)]">
          <button
            onClick={onClose}
            className="h-9 px-3.5 rounded-lg text-[12px] font-medium text-[var(--s-text-muted)] bg-transparent hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input)] transition-colors active:scale-[0.98]"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            autoFocus
            className="h-9 px-4 rounded-lg text-[12px] font-medium bg-[var(--s-text)] text-[var(--s-bg-panel)] hover:opacity-95 transition-all active:scale-[0.98]"
          >
            Insert pattern
          </button>
        </div>
      </div>
    </div>
  );
};
