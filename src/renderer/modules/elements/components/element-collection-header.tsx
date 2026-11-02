import React from "react";
import { ChevronLeft } from "lucide-react";
import { useSignalValue } from "../../../lib/signal";
import { closeElementCollection, elementCollectionsSignal } from "../elements-store";

interface ElementCollectionHeaderProps {
  collectionId: string;
}

export const ElementCollectionHeader: React.FC<ElementCollectionHeaderProps> = ({ collectionId }) => {
  const collection = useSignalValue(elementCollectionsSignal).find((candidate) => candidate.id === collectionId);
  return (
    <div className="flex flex-col gap-1.5 pb-1">
      <button
        type="button"
        onClick={closeElementCollection}
        className="w-fit flex items-center gap-1 h-7 text-[11px] font-semibold text-[var(--s-text-muted)] hover:text-[var(--s-text)]"
      >
        <ChevronLeft size={13} strokeWidth={1.75} />
        All elements
      </button>
      {collection && (
        <div className="flex flex-col gap-0.5">
          <h3 className="text-[13px] font-semibold text-[var(--s-text)]">{collection.name}</h3>
          {collection.credit && <p className="text-[10.5px] leading-snug text-[var(--s-text-subtle)]">{collection.credit}</p>}
        </div>
      )}
    </div>
  );
};
