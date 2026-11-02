import React from "react";
import { setLibraryPage } from "../element-library-store";

interface PageButtonProps {
  page: number;
  isCurrent: boolean;
}

export const PageButton: React.FC<PageButtonProps> = ({ page, isCurrent }) => (
  <button
    type="button"
    aria-current={isCurrent ? "page" : undefined}
    aria-label={`Page ${page}`}
    onClick={() => setLibraryPage(page)}
    className={`min-w-7 h-7 px-1.5 rounded-md text-[11.5px] font-medium tabular-nums transition-colors ${
      isCurrent
        ? "bg-[var(--s-accent)] text-[var(--s-accent-text)]"
        : "text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input)] hover:text-[var(--s-text)]"
    }`}
  >
    {page}
  </button>
);
