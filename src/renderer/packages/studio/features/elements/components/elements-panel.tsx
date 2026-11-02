import React from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import { elementQuerySignal, isBrowsingElements } from "../elements-store";
import { ElementFilters } from "./element-filters";
import { ElementsBrowse } from "./elements-browse";
import { ElementResults } from "./element-results";
import { DocumentComponentsSection } from "../../design-components/ui/document-components-section";
import { KitLogosInsertSection } from "../../../design-kit/logos/kit-logos-insert-section";

export const ElementsPanel: React.FC = () => {
  const query = useSignalValue(elementQuerySignal);
  const browsing = isBrowsingElements(query);
  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <ElementFilters />
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
        {browsing && <KitLogosInsertSection />}
        {browsing && <DocumentComponentsSection />}
        {browsing ? <ElementsBrowse /> : <ElementResults />}
      </div>
    </div>
  );
};
