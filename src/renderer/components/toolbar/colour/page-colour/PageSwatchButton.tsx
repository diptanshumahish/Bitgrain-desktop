import React from "react";
import type { PageColourSwatch } from "./page-colour-swatches";
import { setPageColour } from "./set-page-colour";

interface PageSwatchButtonProps {
  swatch: PageColourSwatch;
  selected: boolean;
}

export const PageSwatchButton: React.FC<PageSwatchButtonProps> = ({ swatch, selected }) => (
  <button
    type="button"
    title={swatch.label}
    aria-label={`${swatch.label} page`}
    aria-pressed={selected}
    onClick={() => setPageColour(swatch.value)}
    className={`h-7 w-7 rounded-full border border-[var(--s-border)] ${swatch.swatchClass} ${selected ? "ring-2 ring-[var(--s-text)] ring-offset-1 ring-offset-[var(--s-bg-panel)]" : ""}`}
  />
);
