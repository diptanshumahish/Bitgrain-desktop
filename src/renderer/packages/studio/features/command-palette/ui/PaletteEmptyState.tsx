import React from "react";

interface PaletteEmptyStateProps {
  query: string;
}

export const PaletteEmptyState: React.FC<PaletteEmptyStateProps> = ({ query }) => (
  <div className="px-5 py-8 text-center">
    <p className="text-[13px] text-[var(--s-text)]">Nothing matches "{query.trim()}"</p>
    <p className="mt-1 text-[12px] text-[var(--s-text-muted)]">Try a simpler word like text, photo, dither or page.</p>
  </div>
);
