import React from "react";
import { closeElementLibrary } from "../element-library-store";
import { LibraryHeader } from "./library-header";
import { LibraryToolbar } from "./library-toolbar";
import { LibraryActiveFilters } from "./library-active-filters";
import { LibraryPagination } from "./library-pagination";
import { LibrarySidebar } from "./sidebar/library-sidebar";
import { LibraryGrid } from "./grid/library-grid";
import { MODAL_LAYER } from "@bitgrain/ui/overlays/layers/layer-order";

export const ElementLibraryModal: React.FC = () => (
  <div className={`fixed inset-0 ${MODAL_LAYER} flex items-center justify-center p-3 md:p-8 font-editorial`}>
    <button
      type="button"
      aria-label="Close elements library"
      onClick={closeElementLibrary}
      className="absolute inset-0 cursor-default bg-black/50 backdrop-blur-sm"
    />
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Elements library"
      className="relative w-full max-w-[1200px] h-[min(860px,94vh)] flex flex-col overflow-hidden rounded-xl border border-[var(--s-border)] bg-[var(--s-bg-panel)] text-[var(--s-text)] "
    >
      <LibraryHeader />
      <div className="flex-1 min-h-0 flex">
        <LibrarySidebar />
        <div className="flex-1 min-w-0 flex flex-col">
          <LibraryToolbar />
          <LibraryActiveFilters />
          <LibraryGrid />
          <LibraryPagination />
        </div>
      </div>
    </div>
  </div>
);
