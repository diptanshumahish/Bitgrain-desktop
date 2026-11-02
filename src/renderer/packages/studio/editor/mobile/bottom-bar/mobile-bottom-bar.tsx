import React, { useRef } from "react";
import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { useSignalValue } from "@bitgrain/core/signal";
import { mobileSheetSignal, toggleMobileSheet } from "../mobile-sheet-state";
import { MobileIdleActions } from "./mobile-idle-actions";
import { MobileLayerActions } from "./mobile-layer-actions";
import type { PickedImage } from "./read-picked-image";
import { useBarHeightVar } from "./use-bar-height-var";

interface MobileBottomBarProps {
  selectedLayer: Layer | null;
  pageCount: number;
  onDone: () => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onReplacePhoto: (id: string, image: PickedImage) => void;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  selectedLayer, pageCount, onDone, onDuplicate, onDelete, onReplacePhoto,
}) => {
  const activeSheet = useSignalValue(mobileSheetSignal);
  const barRef = useRef<HTMLElement>(null);
  useBarHeightVar(barRef);

  return (
    <nav ref={barRef} aria-label="Design tools" className="relative z-[60] shrink-0 border-t border-[var(--s-border)] bg-[var(--s-bg-panel)] pt-1.5 pb-safe">
      {selectedLayer ? (
        <MobileLayerActions
          key={selectedLayer.id}
          layer={selectedLayer}
          activeSheet={activeSheet}
          onOpen={toggleMobileSheet}
          onDone={onDone}
          onDuplicate={() => onDuplicate(selectedLayer.id)}
          onDelete={() => onDelete(selectedLayer.id)}
          onReplacePhoto={(image) => onReplacePhoto(selectedLayer.id, image)}
        />
      ) : (
        <MobileIdleActions activeSheet={activeSheet} pageCount={pageCount} onOpen={toggleMobileSheet} />
      )}
    </nav>
  );
};
