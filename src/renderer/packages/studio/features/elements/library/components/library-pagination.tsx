import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSignalValue } from "@bitgrain/core/signal";
import { LIBRARY_PAGE_SIZE } from "../element-library-api";
import { libraryQuerySignal, libraryTotalSignal, setLibraryPage } from "../element-library-store";
import { buildPageRange } from "../page-range";
import { PageButton } from "./page-button";
import { LibraryFooterArt } from "./library-footer-art";

const countFormat = new Intl.NumberFormat();

const STEP_CLASS =
  "h-7 flex items-center gap-1 px-2 rounded-md text-[11.5px] font-medium text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input)] hover:text-[var(--s-text)] disabled:opacity-40 disabled:pointer-events-none";

export const LibraryPagination: React.FC = () => {
  const query = useSignalValue(libraryQuerySignal);
  const total = useSignalValue(libraryTotalSignal);
  const totalPages = Math.ceil(total / LIBRARY_PAGE_SIZE);
  if (totalPages === 0) return null;

  const firstShown = (query.page - 1) * LIBRARY_PAGE_SIZE + 1;
  const lastShown = Math.min(query.page * LIBRARY_PAGE_SIZE, total);

  return (
    <nav
      aria-label="Library pages"
      className="flex items-center gap-6 px-5 py-2 border-t border-[var(--s-border)] shrink-0"
    >
      <span className="shrink-0 text-[11px] text-[var(--s-text-subtle)] tabular-nums">
        Showing {countFormat.format(firstShown)} to {countFormat.format(lastShown)} of {countFormat.format(total)}
      </span>
      <LibraryFooterArt />
      {totalPages > 1 && (
        <div className="shrink-0 ml-auto flex items-center gap-0.5">
          <button type="button" disabled={query.page <= 1} onClick={() => setLibraryPage(query.page - 1)} className={STEP_CLASS}>
            <ChevronLeft size={13} strokeWidth={2} />
            Previous
          </button>
          {buildPageRange(query.page, totalPages).map((slot, index) =>
            slot === "gap" ? (
              <span key={`gap-${index}`} className="w-6 text-center text-[11.5px] text-[var(--s-text-subtle)]">
                ...
              </span>
            ) : (
              <PageButton key={slot} page={slot} isCurrent={slot === query.page} />
            ),
          )}
          <button type="button" disabled={query.page >= totalPages} onClick={() => setLibraryPage(query.page + 1)} className={STEP_CLASS}>
            Next
            <ChevronRight size={13} strokeWidth={2} />
          </button>
        </div>
      )}
    </nav>
  );
};
