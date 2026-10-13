import React from "react";
import { openElementCollection } from "../elements-store";
import type { ElementCollection } from "../element-types";
import { ElementTile } from "./element-tile";

const ROW_PREVIEW_COUNT = 3;

interface ElementCollectionRowProps {
  collection: ElementCollection;
}

export const ElementCollectionRow: React.FC<ElementCollectionRowProps> = ({ collection }) => {
  const shown = collection.preview.slice(0, ROW_PREVIEW_COUNT);
  const remaining = collection.count - shown.length;
  return (
    <section className="flex flex-col gap-2" aria-label={collection.name}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5 min-w-0">
          <h3 className="text-[11.5px] font-semibold text-[var(--s-text)]">{collection.name}</h3>
          {collection.credit && (
            <p className="text-[10.5px] leading-snug text-[var(--s-text-subtle)]">{collection.credit}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => openElementCollection(collection.id)}
          className="shrink-0 text-[10.5px] font-semibold text-[var(--s-text-muted)] hover:text-[var(--s-text)]"
        >
          See all
        </button>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {shown.map((element) => (
          <ElementTile key={element.id} element={element} />
        ))}
      </div>
      {remaining > 0 && (
        <button
          type="button"
          onClick={() => openElementCollection(collection.id)}
          className="h-7 rounded-md border border-[var(--s-border)] text-[10.5px] font-medium text-[var(--s-text-muted)] hover:text-[var(--s-text)]"
        >
          {remaining} more in {collection.name}
        </button>
      )}
    </section>
  );
};
