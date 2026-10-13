import React from "react";
import { useSignalValue } from "../../../lib/signal";
import {
  elementQuerySignal,
  elementResultsCursorSignal,
  elementResultsSignal,
  elementResultsStatusSignal,
  loadMoreElements,
} from "../elements-store";
import { ElementTile } from "./element-tile";
import { isWideElement } from "../element-shape";
import { ElementsMessage } from "./elements-message";
import { ElementCollectionHeader } from "./element-collection-header";

export const ElementResults: React.FC = () => {
  const query = useSignalValue(elementQuerySignal);
  const results = useSignalValue(elementResultsSignal);
  const status = useSignalValue(elementResultsStatusSignal);
  const cursor = useSignalValue(elementResultsCursorSignal);
  const isEmpty = status === "ready" && results.length === 0;

  return (
    <div className="flex flex-col gap-2 px-3.5 pt-1 pb-4">
      {query.collectionId && <ElementCollectionHeader collectionId={query.collectionId} />}
      {isEmpty && <ElementsMessage text="Nothing matches. Try a motif like lotus, wave or star, or clear the filter." />}
      <div className="grid grid-cols-3 gap-1.5">
        {results.map((element) => (
          <ElementTile key={element.id} element={element} fullRow={isWideElement(element)} />
        ))}
      </div>
      {status === "loading" && <ElementsMessage text="Loading elements" />}
      {cursor && status === "ready" && (
        <button
          type="button"
          onClick={loadMoreElements}
          className="h-7 rounded-md border border-[var(--s-border)] text-[10.5px] font-medium text-[var(--s-text-muted)] hover:text-[var(--s-text)]"
        >
          Show more
        </button>
      )}
    </div>
  );
};
