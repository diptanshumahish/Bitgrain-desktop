import React from "react";
import { X } from "lucide-react";
import { useSignalValue } from "@bitgrain/core/signal";
import { elementCollectionsSignal } from "../../elements-store";
import { closeElementLibrary } from "../element-library-store";
import { LibraryHeaderArt } from "./library-header-art";
import { Button } from "@bitgrain/ui/components/Button";

const countFormat = new Intl.NumberFormat();

export const LibraryHeader: React.FC = () => {
  const collections = useSignalValue(elementCollectionsSignal);
  const elementCount = collections.reduce((sum, collection) => sum + collection.count, 0);
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-[var(--s-border)] shrink-0">
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <h2 className="text-[15px] font-semibold">Elements library</h2>
        <p className="text-[12px] text-[var(--s-text-muted)]">
          {elementCount > 0
            ? `${countFormat.format(elementCount)} graphics across ${countFormat.format(collections.length)} collections. Click one to add it to your page.`
            : "Borders, corners, motifs and scenes. Click one to add it to your page."}
        </p>
      </div>
      <LibraryHeaderArt />
      <Button
        variant="ghost"
        size="sm"
        iconOnly
        onClick={closeElementLibrary}
        aria-label="Close"
        title="Close"
        className="shrink-0 self-start"
      >
        <X size={16} strokeWidth={2} />
      </Button>
    </div>
  );
};
