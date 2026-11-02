import React from "react";
import { useSignalValue } from "../../../../lib/signal";
import { paperColorSignal } from "../../../../store/transform-store";
import { CUSTOM_PICKER_FALLBACK, PAGE_COLOUR_SWATCHES } from "./page-colour-swatches";
import { commitPageColour, previewPageColour, setPageColour } from "./set-page-colour";
import { PageSwatchButton } from "./PageSwatchButton";

export const PageColourRow: React.FC = () => {
  const paperColor = useSignalValue(paperColorSignal);
  const isCustom = !!paperColor && !PAGE_COLOUR_SWATCHES.some((swatch) => swatch.value === paperColor);
  return (
    <div className="px-2 py-2">
      <span className="block text-[12px] font-medium leading-tight text-[var(--s-text)]">Page colour</span>
      <span className="block text-[12px] text-[var(--s-text-subtle)] leading-tight mt-0.5">Auto keeps each effect's own paper</span>
      <div className="flex flex-wrap items-center gap-1.5 mt-2">
        <button
          type="button"
          onClick={() => setPageColour(null)}
          aria-pressed={paperColor === null}
          className={`h-7 px-2.5 rounded-full text-[12px] border transition-colors ${paperColor === null ? "border-[var(--s-text)] text-[var(--s-text)]" : "border-[var(--s-border)] text-[var(--s-text-muted)] hover:text-[var(--s-text)]"}`}
        >
          Auto
        </button>
        {PAGE_COLOUR_SWATCHES.map((swatch) => (
          <PageSwatchButton key={swatch.value} swatch={swatch} selected={paperColor === swatch.value} />
        ))}
        <label
          title="Custom colour"
          className={`relative h-7 w-7 rounded-full border overflow-hidden cursor-pointer bg-[conic-gradient(#f87171,#facc15,#4ade80,#60a5fa,#c084fc,#f87171)] ${isCustom ? "ring-2 ring-[var(--s-text)] ring-offset-1 ring-offset-[var(--s-bg-panel)]" : "border-[var(--s-border)]"}`}
        >
          <input
            type="color"
            aria-label="Custom page colour"
            value={paperColor ?? CUSTOM_PICKER_FALLBACK}
            onChange={(event) => previewPageColour(event.target.value)}
            onBlur={commitPageColour}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </label>
      </div>
    </div>
  );
};
