import React, { useEffect } from "react";
import { LayoutGrid } from "lucide-react";
import { useSignalValue } from "@bitgrain/core/signal";
import { elementCollectionsSignal, elementCollectionsStatusSignal, loadElementCollections } from "../elements-store";
import { ElementCollectionRow } from "./element-collection-row";
import { ElementsMessage } from "./elements-message";
import { ElementsEmptyState } from "./elements-empty-state";
import { emitOpenElementLibrary } from "../library/element-library-events";
import { Button } from "@bitgrain/ui/components/Button";

export const ElementsBrowse: React.FC = () => {
  const collections = useSignalValue(elementCollectionsSignal);
  const status = useSignalValue(elementCollectionsStatusSignal);

  useEffect(() => {
    void loadElementCollections();
  }, []);

  if (status === "loading" || status === "idle") return <ElementsMessage text="Loading elements" />;
  if (collections.length === 0) {
    return <ElementsEmptyState />;
  }
  return (
    <div className="flex flex-col gap-5 px-3.5 pt-1 pb-4">
      <Button onClick={() => emitOpenElementLibrary()} fullWidth>
        <LayoutGrid size={13} strokeWidth={1.75} />
        Browse the full library
      </Button>
      {collections.map((collection) => (
        <ElementCollectionRow key={collection.id} collection={collection} />
      ))}
    </div>
  );
};
