import React from "react";
import { LibraryKindList } from "./library-kind-list";
import { LibraryCollectionList } from "./library-collection-list";

export const LibrarySidebar: React.FC = () => (
  <aside className="hidden md:flex w-[248px] shrink-0 flex-col gap-6 px-3 py-4 border-r border-[var(--s-border)] bg-[var(--s-bg-panel-alt)] overflow-y-auto no-scrollbar">
    <LibraryKindList />
    <LibraryCollectionList />
  </aside>
);
