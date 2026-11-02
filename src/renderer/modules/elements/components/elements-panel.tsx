import React from "react";
import { useSignalValue } from "../../../lib/signal";
import { elementQuerySignal, isBrowsingElements } from "../elements-store";
import { ElementFilters } from "./element-filters";
import { ElementsBrowse } from "./elements-browse";
import { ElementResults } from "./element-results";

export const ElementsPanel: React.FC = () => {
  const query = useSignalValue(elementQuerySignal);
  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <ElementFilters />
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
        {isBrowsingElements(query) ? <ElementsBrowse /> : <ElementResults />}
      </div>
    </div>
  );
};
